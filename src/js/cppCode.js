
const cppCode = `
/****************************************************************************
 Copyright (c) 2013 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
#include "physics/CCPhysicsBody.h"
#if CC_USE_PHYSICS

#include <climits>
#include <algorithm>
#include <cmath>

#include "chipmunk/chipmunk_private.h"

#include "2d/CCScene.h"
#include "physics/CCPhysicsShape.h"
#include "physics/CCPhysicsJoint.h"
#include "physics/CCPhysicsWorld.h"
#include "physics/CCPhysicsHelper.h"

static void internalBodySetMass(cpBody *body, cpFloat mass)
{
    cpBodyActivate(body);
    body->m = mass;
    body->m_inv = 1.0f/mass;
    //cpAssertSaneBody(body);
}

static void internalBodyUpdateVelocity(cpBody *body, cpVect gravity, cpFloat damping, cpFloat dt)
{
    cpBodyUpdateVelocity(body, cpvzero, damping, dt);
    // Skip kinematic bodies.
    if(cpBodyGetType(body) == CP_BODY_TYPE_KINEMATIC) return;

    cpAssertSoft(body->m > 0.0f && body->i > 0.0f, "Body's mass and moment must be positive to simulate. (Mass: %f Moment: f)", body->m, body->i);

    cocos2d::PhysicsBody *physicsBody = static_cast<cocos2d::PhysicsBody*>(body->userData);

    if(physicsBody->isGravityEnabled())
            body->v = cpvclamp(cpvadd(cpvmult(body->v, damping), cpvmult(cpvadd(gravity, cpvmult(body->f, body->m_inv)), dt)), physicsBody->getVelocityLimit());
    else
            body->v = cpvclamp(cpvadd(cpvmult(body->v, damping), cpvmult(cpvmult(body->f, body->m_inv), dt)), physicsBody->getVelocityLimit());
    cpFloat w_limit = physicsBody->getAngularVelocityLimit();
    body->w = cpfclamp(body->w*damping + body->t*body->i_inv*dt, -w_limit, w_limit);

    // Reset forces.
    body->f = cpvzero;
    //to check body sanity
    cpBodySetTorque(body, 0.0f);
}

NS_CC_BEGIN
extern const float PHYSICS_INFINITY;

const std::string PhysicsBody::COMPONENT_NAME = "PhysicsBody";

namespace
{
    static const float MASS_DEFAULT = 1.0;
    static const float MOMENT_DEFAULT = 200;
}

PhysicsBody::PhysicsBody()
: _world(nullptr)
, _cpBody(nullptr)
, _dynamic(true)
, _rotationEnabled(true)
, _gravityEnabled(true)
, _massDefault(true)
, _momentDefault(true)
, _mass(MASS_DEFAULT)
, _area(0.0f)
, _density(0.0f)
, _moment(MOMENT_DEFAULT)
, _velocityLimit(PHYSICS_INFINITY)
, _angularVelocityLimit(PHYSICS_INFINITY)
, _isDamping(false)
, _linearDamping(0.0f)
, _angularDamping(0.0f)
, _tag(0)
, _rotationOffset(0)
, _recordedRotation(0.0f)
, _recordedAngle(0.0)
, _massSetByUser(false)
, _momentSetByUser(false)
, _recordScaleX(1.f)
, _recordScaleY(1.f)
{
    _name = COMPONENT_NAME;
}

PhysicsBody::~PhysicsBody()
{
    for (auto it = _joints.begin(); it != _joints.end(); ++it)
    {
        PhysicsJoint* joint = *it;

        PhysicsBody* other = joint->getBodyA() == this ? joint->getBodyB() : joint->getBodyA();
        other->removeJoint(joint);
        delete joint;
    }

    if (_cpBody)
    {
        cpBodyFree(_cpBody);
    }
}

PhysicsBody* PhysicsBody::create()
{
    PhysicsBody* body = new (std::nothrow) PhysicsBody();
    if (body && body->init())
    {
        body->autorelease();
        return body;
    }

    CC_SAFE_DELETE(body);
    return nullptr;
}

PhysicsBody* PhysicsBody::create(float mass)
{
    PhysicsBody* body = new (std::nothrow) PhysicsBody();
    if (body)
    {
        body->_mass = mass;
        body->_massDefault = false;
        if (body->init())
        {
            body->autorelease();
            return body;
        }
    }

    CC_SAFE_DELETE(body);
    return nullptr;
}

PhysicsBody* PhysicsBody::create(float mass, float moment)
{
    PhysicsBody* body = new (std::nothrow) PhysicsBody();
    if (body)
    {
        body->_mass = mass;
        body->_massDefault = false;
        body->_moment = moment;
        body->_momentDefault = false;
        if (body->init())
        {
            body->autorelease();
            return body;
        }
    }

    CC_SAFE_DELETE(body);
    return nullptr;

}

PhysicsBody* PhysicsBody::createCircle(float radius, const PhysicsMaterial& material, const Vec2& offset)
{
    PhysicsBody* body = new (std::nothrow) PhysicsBody();
    if (body && body->init())
    {
        body->addShape(PhysicsShapeCircle::create(radius, material, offset));
        body->autorelease();
        return body;
    }

    CC_SAFE_DELETE(body);
    return nullptr;
}

PhysicsBody* PhysicsBody::createBox(const Size& size, const PhysicsMaterial& material, const Vec2& offset)
{
    PhysicsBody* body = new (std::nothrow) PhysicsBody();
    if (body && body->init())
    {
        body->addShape(PhysicsShapeBox::create(size, material, offset));
        body->autorelease();
        return body;
    }

    CC_SAFE_DELETE(body);
    return nullptr;
}

PhysicsBody* PhysicsBody::createPolygon(const Vec2* points, int count, const PhysicsMaterial& material, const Vec2& offset)
{
    PhysicsBody* body = new (std::nothrow) PhysicsBody();
    if (body && body->init())
    {
        body->addShape(PhysicsShapePolygon::create(points, count, material, offset));
        body->autorelease();
        return body;
    }

    CC_SAFE_DELETE(body);
    return nullptr;
}

PhysicsBody* PhysicsBody::createEdgeSegment(const Vec2& a, const Vec2& b, const PhysicsMaterial& material, float border/* = 1*/)
{
    PhysicsBody* body = new (std::nothrow) PhysicsBody();
    if (body && body->init())
    {
        body->addShape(PhysicsShapeEdgeSegment::create(a, b, material, border));
        body->setDynamic(false);
        body->autorelease();
        return body;
    }

    CC_SAFE_DELETE(body);
    return nullptr;
}

PhysicsBody* PhysicsBody::createEdgeBox(const Size& size, const PhysicsMaterial& material, float border/* = 1*/, const Vec2& offset)
{
    PhysicsBody* body = new (std::nothrow) PhysicsBody();
    if (body && body->init())
    {
        body->addShape(PhysicsShapeEdgeBox::create(size, material, border, offset));
        body->setDynamic(false);
        body->autorelease();
        return body;
    }

    CC_SAFE_DELETE(body);

    return nullptr;
}

PhysicsBody* PhysicsBody::createEdgePolygon(const Vec2* points, int count, const PhysicsMaterial& material, float border/* = 1*/)
{
    PhysicsBody* body = new (std::nothrow) PhysicsBody();
    if (body && body->init())
    {
        body->addShape(PhysicsShapeEdgePolygon::create(points, count, material, border));
        body->setDynamic(false);
        body->autorelease();
        return body;
    }

    CC_SAFE_DELETE(body);

    return nullptr;
}

PhysicsBody* PhysicsBody::createEdgeChain(const Vec2* points, int count, const PhysicsMaterial& material, float border/* = 1*/)
{
    PhysicsBody* body = new (std::nothrow) PhysicsBody();
    if (body && body->init())
    {
        body->addShape(PhysicsShapeEdgeChain::create(points, count, material, border));
        body->setDynamic(false);
        body->autorelease();
        return body;
    }

    CC_SAFE_DELETE(body);

    return nullptr;
}

bool PhysicsBody::init()
{
    do
    {
        _cpBody = cpBodyNew(_mass, _moment);
        internalBodySetMass(_cpBody, _mass);
        cpBodySetUserData(_cpBody, this);
        cpBodySetVelocityUpdateFunc(_cpBody, internalBodyUpdateVelocity);

        CC_BREAK_IF(_cpBody == nullptr);

        return true;
    } while (false);

    return false;
}

void PhysicsBody::removeJoint(PhysicsJoint* joint)
{
    auto it = std::find(_joints.begin(), _joints.end(), joint);

    if (it != _joints.end())
    {
        _joints.erase(it);
    }
}

void PhysicsBody::setDynamic(bool dynamic)
{
    if (dynamic != _dynamic)
    {
        _dynamic = dynamic;
        if (dynamic)
        {
            cpBodySetType(_cpBody, CP_BODY_TYPE_DYNAMIC);
            internalBodySetMass(_cpBody, _mass);
            cpBodySetMoment(_cpBody, _moment);
        }
        else
        {
            cpBodySetType(_cpBody, CP_BODY_TYPE_KINEMATIC);
        }
    }
}

void PhysicsBody::setRotationEnable(bool enable)
{
    if (_rotationEnabled != enable)
    {
        cpBodySetMoment(_cpBody, enable ? _moment : PHYSICS_INFINITY);
        _rotationEnabled = enable;
    }
}

void PhysicsBody::setGravityEnable(bool enable)
{
    _gravityEnabled = enable;
}

void PhysicsBody::setRotation(float rotation)
{
    _recordedRotation = rotation;
    _recordedAngle = - (rotation + _rotationOffset) * (M_PI / 180.0);
    cpBodySetAngle(_cpBody, _recordedAngle);
}

void PhysicsBody::setScale(float scaleX, float scaleY)
{
    for (auto shape : _shapes)
    {
        _area -= shape->getArea();
        if (!_massSetByUser)
            addMass(-shape->getMass());
        if (!_momentSetByUser)
            addMoment(-shape->getMoment());

        shape->setScale(scaleX, scaleY);

        _area += shape->getArea();
        if (!_massSetByUser)
            addMass(shape->getMass());
        if (!_momentSetByUser)
            addMoment(shape->getMoment());
    }
}

void PhysicsBody::setPosition(float positionX, float positionY)
{
    cpVect tt;

    tt.x = positionX + _positionOffset.x;
    tt.y = positionY + _positionOffset.y;

    cpBodySetPosition(_cpBody, tt);
}

Vec2 PhysicsBody::getPosition() const
{
    cpVect tt = cpBodyGetPosition(_cpBody);
    return Vec2(tt.x - _positionOffset.x, tt.y - _positionOffset.y);
}

void PhysicsBody::setPositionOffset(const Vec2& position)
{
    if (!_positionOffset.equals(position))
    {
        Vec2 pos = getPosition();
        _positionOffset = position;
        setPosition(pos.x, pos.y);
    }
}

float PhysicsBody::getRotation()
{
    if (_recordedAngle != cpBodyGetAngle(_cpBody)) {
        _recordedAngle = cpBodyGetAngle(_cpBody);
        _recordedRotation = - _recordedAngle * 180.0 / M_PI - _rotationOffset;
    }
    return _recordedRotation;
}

PhysicsShape* PhysicsBody::addShape(PhysicsShape* shape, bool addMassAndMoment/* = true*/)
{
    if (shape == nullptr) return nullptr;

    // add shape to body
    if (_shapes.getIndex(shape) == -1)
    {
        shape->setBody(this);

        // calculate the area, mass, and density
        // area must update before mass, because the density changes depend on it.
        if (addMassAndMoment)
        {
            _area += shape->getArea();
            addMass(shape->getMass());
            addMoment(shape->getMoment());
        }

        if (_world && cpBodyGetSpace(_cpBody))
        {
            _world->addShape(shape);
        }

        _shapes.pushBack(shape);
    }

    return shape;
}

void PhysicsBody::applyForce(const Vec2& force, const Vec2& offset)
{
    if (_dynamic && _mass != PHYSICS_INFINITY)
    {
        cpBodyApplyForceAtLocalPoint(_cpBody, PhysicsHelper::point2cpv(force), PhysicsHelper::point2cpv(offset));
    }
}

void PhysicsBody::resetForces()
{
    cpBodySetForce(_cpBody,  PhysicsHelper::point2cpv(Vec2(0,0)));
}

void PhysicsBody::applyImpulse(const Vec2& impulse, const Vec2& offset)
{
    cpBodyApplyImpulseAtLocalPoint(_cpBody, PhysicsHelper::point2cpv(impulse), PhysicsHelper::point2cpv(offset));
}

void PhysicsBody::applyTorque(float torque)
{
    cpBodySetTorque(_cpBody, torque);
}`

export default cppCode;
