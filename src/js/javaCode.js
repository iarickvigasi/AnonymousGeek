

const javaCode = `
/**
 * Copyright 2015 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See
 * the License for the specific language governing permissions and limitations under the License.
 */
package rx;

import java.util.Collection;
import java.util.concurrent.*;

import rx.Observable.Operator;
import rx.annotations.Beta;
import rx.annotations.Experimental;
import rx.exceptions.Exceptions;
import rx.exceptions.OnErrorNotImplementedException;
import rx.functions.*;
import rx.internal.operators.*;
import rx.internal.producers.SingleDelayedProducer;
import rx.internal.util.ScalarSynchronousSingle;
import rx.internal.util.UtilityFunctions;
import rx.observers.SafeSubscriber;
import rx.observers.SerializedSubscriber;
import rx.plugins.RxJavaObservableExecutionHook;
import rx.plugins.RxJavaPlugins;
import rx.plugins.RxJavaSingleExecutionHook;
import rx.schedulers.Schedulers;
import rx.singles.BlockingSingle;
import rx.subscriptions.Subscriptions;

/**
 * The Single class implements the Reactive Pattern for a single value response. See {@link Observable} for the
 * implementation of the Reactive Pattern for a stream or vector of values.
 * <p>
 * {@code Single} behaves the same as {@link Observable} except that it can only emit either a single successful
 * value, or an error (there is no "onComplete" notification as there is for {@link Observable})
 * <p>
 * Like an {@link Observable}, a {@code Single} is lazy, can be either "hot" or "cold", synchronous or
 * asynchronous.
 * <p>
 * The documentation for this class makes use of marble diagrams. The following legend explains these diagrams:
 * <p>
 * <img width="605" height="285" src="https://raw.github.com/wiki/ReactiveX/RxJava/images/rx-operators/Single.legend.png" alt="">
 * <p>
 * For more information see the <a href="http://reactivex.io/documentation/observable.html">ReactiveX
 * documentation</a>.
 *
 * @param <T>
 *            the type of the item emitted by the Single
 * @since (If this class graduates from "Experimental" replace this parenthetical with the release number)
 */
@Beta
public class Single<T> {

    final Observable.OnSubscribe<T> onSubscribe;

    /**
     * Creates a Single with a Function to execute when it is subscribed to (executed).
     * <p>
     * <em>Note:</em> Use {@link #create(OnSubscribe)} to create a Single, instead of this constructor,
     * unless you specifically have a need for inheritance.
     *
     * @param f
     *            {@code OnExecute} to be executed when {@code execute(SingleSubscriber)} or
     *            {@code subscribe(Subscriber)} is called
     */
    protected Single(final OnSubscribe<T> f) {
        // bridge between OnSubscribe (which all Operators and Observables use) and OnExecute (for Single)
        this.onSubscribe = new Observable.OnSubscribe<T>() {

            @Override
            public void call(final Subscriber<? super T> child) {
                final SingleDelayedProducer<T> producer = new SingleDelayedProducer<T>(child);
                child.setProducer(producer);
                SingleSubscriber<T> ss = new SingleSubscriber<T>() {

                    @Override
                    public void onSuccess(T value) {
                        producer.setValue(value);
                    }

                    @Override
                    public void onError(Throwable error) {
                        child.onError(error);
                    }

                };
                child.add(ss);
                f.call(ss);
            }

        };
    }

    private Single(final Observable.OnSubscribe<T> f) {
        this.onSubscribe = f;
    }

    static RxJavaSingleExecutionHook hook = RxJavaPlugins.getInstance().getSingleExecutionHook();

    /**
     * Returns a Single that will execute the specified function when a {@link SingleSubscriber} executes it or
     * a {@link Subscriber} subscribes to it.
     * <p>
     * <img width="640" height="200" src="https://raw.github.com/wiki/ReactiveX/RxJava/images/rx-operators/Single.create.png" alt="">
     * <p>
     * Write the function you pass to {@code create} so that it behaves as a Single: It should invoke the
     * SingleSubscriber {@link SingleSubscriber#onSuccess onSuccess} and/or
     * {@link SingleSubscriber#onError onError} methods appropriately.
     * <p>
     * A well-formed Single must invoke either the SingleSubscriber's {@code onSuccess} method exactly once or
     * its {@code onError} method exactly once.
     * <p>
     * <dl>
     * <dt><b>Scheduler:</b></dt>
     * <dd>{@code create} does not operate by default on a particular {@link Scheduler}.</dd>
     * </dl>
     *
     * @param <T>
     *            the type of the item that this Single emits
     * @param f
     *            a function that accepts an {@code SingleSubscriber<T>}, and invokes its {@code onSuccess} or
     *            {@code onError} methods as appropriate
     * @return a Single that, when a {@link Subscriber} subscribes to it, will execute the specified function
     * @see <a href="http://reactivex.io/documentation/operators/create.html">ReactiveX operators documentation: Create</a>
     */
    public static <T> Single<T> create(OnSubscribe<T> f) {
        return new Single<T>(hook.onCreate(f));
    }

    /**
     * Invoked when Single.execute is called.
     */
    public interface OnSubscribe<T> extends Action1<SingleSubscriber<? super T>> {
        // cover for generics insanity
    }

    /**
     * Lifts a function to the current Single and returns a new Single that when subscribed to will pass the
     * values of the current Single through the Operator function.
     * <p>
     * In other words, this allows chaining TaskExecutors together on a Single for acting on the values within
     * the Single.
     * <p>
     * {@code task.map(...).filter(...).lift(new OperatorA()).lift(new OperatorB(...)).subscribe() }
     * <p>
     * If the operator you are creating is designed to act on the item emitted by a source Single, use
     * {@code lift}. If your operator is designed to transform the source Single as a whole (for instance, by
     * applying a particular set of existing RxJava operators to it) use {@link #compose}.
     * <dl>
     * <dt><b>Scheduler:</b></dt>
     * <dd>{@code lift} does not operate by default on a particular {@link Scheduler}.</dd>
     * </dl>
     *
     * @param lift
     *            the Operator that implements the Single-operating function to be applied to the source Single
     * @return a Single that is the result of applying the lifted Operator to the source Single
     * @see <a href="https://github.com/ReactiveX/RxJava/wiki/Implementing-Your-Own-Operators">RxJava wiki: Implementing Your Own Operators</a>
     */
    @Experimental
    public final <R> Single<R> lift(final Operator<? extends R, ? super T> lift) {
        return new Single<R>(new Observable.OnSubscribe<R>() {
            @Override
            public void call(Subscriber<? super R> o) {
                try {
                    final Subscriber<? super T> st = hook.onLift(lift).call(o);
                    try {
                        // new Subscriber created and being subscribed with so 'onStart' it
                        st.onStart();
                        onSubscribe.call(st);
                    } catch (Throwable e) {
                        // localized capture of errors rather than it skipping all operators
                        // and ending up in the try/catch of the subscribe method which then
                        // prevents onErrorResumeNext and other similar approaches to error handling
                        Exceptions.throwOrReport(e, st);
                    }
                } catch (Throwable e) {
                    // if the lift function failed all we can do is pass the error to the final Subscriber
                    // as we don't have the operator available to us
                    Exceptions.throwOrReport(e, o);
                }
            }
        });
    }

    /**
     * Transform a Single by applying a particular Transformer function to it.
     * <p>
     * This method operates on the Single itself whereas {@link #lift} operates on the Single's Subscribers or
     * Observers.
     * <p>
     * If the operator you are creating is designed to act on the individual item emitted by a Single, use
     * {@link #lift}. If your operator is designed to transform the source Single as a whole (for instance, by
     * applying a particular set of existing RxJava operators to it) use {@code compose}.
     * <dl>
     * <dt><b>Scheduler:</b></dt>
     * <dd>{@code compose} does not operate by default on a particular {@link Scheduler}.</dd>
     * </dl>
     *
     * @param transformer
     *            implements the function that transforms the source Single
     * @return the source Single, transformed by the transformer function
     * @see <a href="https://github.com/ReactiveX/RxJava/wiki/Implementing-Your-Own-Operators">RxJava wiki: Implementing Your Own Operators</a>
     */
    @SuppressWarnings("unchecked")
    public <R> Single<R> compose(Transformer<? super T, ? extends R> transformer) {
        return ((Transformer<T, R>) transformer).call(this);
    }

    /**
     * Transformer function used by {@link #compose}.
     *
     * @warn more complete description needed
     */
    public interface Transformer<T, R> extends Func1<Single<T>, Single<R>> {
        // cover for generics insanity
    }

    /**
     * <img width="640" height="305" src="https://raw.github.com/wiki/ReactiveX/RxJava/images/rx-operators/Single.toObservable.png" alt="">
     *
     * @warn more complete description needed
     */
    private static <T> Observable<T> asObservable(Single<T> t) {
        // is this sufficient, or do I need to keep the outer Single and subscribe to it?
        return Observable.create(t.onSubscribe);
    }

    /**
     * INTERNAL: Used with lift and operators.
     *
     * Converts the source {@code Single<T>} into an {@code Single<Observable<T>>} that emits an Observable
     * that emits the same emission as the source Single.
     * <p>
     * <img width="640" height="310" src="https://raw.github.com/wiki/ReactiveX/RxJava/images/rx-operators/Single.nest.png" alt="">
     * <dl>
     * <dt><b>Scheduler:</b></dt>
     * <dd>{@code nest} does not operate by default on a particular {@link Scheduler}.</dd>
     * </dl>
     *
     * @return a Single that emits an Observable that emits the same item as the source Single
     * @see <a href="http://reactivex.io/documentation/operators/to.html">ReactiveX operators documentation: To</a>
     */
    private Single<Observable<T>> nest() {
        return Single.just(asObservable(this));
    }

    /* *********************************************************************************************************
     * Operators Below Here
     * *********************************************************************************************************
     */

    /**
     * Returns an Observable that emits the items emitted by two Singles, one after the other.
     * <p>
     * <img width="640" height="380" src="https://raw.github.com/wiki/ReactiveX/RxJava/images/rx-operators/Single.concat.png" alt="">
     * <dl>
     * <dt><b>Scheduler:</b></dt>
     * <dd>{@code concat} does not operate by default on a particular {@link Scheduler}.</dd>
     * </dl>
     *
     * @param t1
     *            an Single to be concatenated
     * @param t2
     *            an Single to be concatenated
     * @return an Observable that emits items emitted by the two source Singles, one after the other.
     * @see <a href="http://reactivex.io/documentation/operators/concat.html">ReactiveX operators documentation: Concat</a>
     */
    public static <T> Observable<T> concat(Single<? extends T> t1, Single<? extends T> t2) {
        return Observable.concat(asObservable(t1), asObservable(t2));
    }

    /**
     * Returns an Observable that emits the items emitted by three Singles, one after the other.
     * <p>
     * <img width="640" height="380" src="https://raw.github.com/wiki/ReactiveX/RxJava/images/rx-operators/Single.concat.png" alt="">
     * <dl>
     * <dt><b>Scheduler:</b></dt>
     * <dd>{@code concat} does not operate by default on a particular {@link Scheduler}.</dd>
     * </dl>
     *
     * @param t1
     *            a Single to be concatenated
     * @param t2
     *            a Single to be concatenated
     * @param t3
     *            a Single to be concatenated
     * @return an Observable that emits items emitted by the three source Singles, one after the other.
     * @see <a href="http://reactivex.io/documentation/operators/concat.html">ReactiveX operators documentation: Concat</a>
     */
    public static <T> Observable<T> concat(Single<? extends T> t1, Single<? extends T> t2, Single<? extends T> t3) {
        return Observable.concat(asObservable(t1), asObservable(t2), asObservable(t3));
    }

    /**
     * Returns an Observable that emits the items emitted by four Singles, one after the other.
     * <p>
     * <img width="640" height="380" src="https://raw.github.com/wiki/ReactiveX/RxJava/images/rx-operators/Single.concat.png" alt="">
     * <dl>
     * <dt><b>Scheduler:</b></dt>
     * <dd>{@code concat} does not operate by default on a particular {@link Scheduler}.</dd>
     * </dl>
     *
     * @param t1
     *            a Single to be concatenated
     * @param t2
     *            a Single to be concatenated
     * @param t3
     *            a Single to be concatenated
     * @param t4
     *            a Single to be concatenated
     * @return an Observable that emits items emitted by the four source Singles, one after the other.
     * @see <a href="http://reactivex.io/documentation/operators/concat.html">ReactiveX operators documentation: Concat</a>
     */
    public static <T> Observable<T> concat(Single<? extends T> t1, Single<? extends T> t2, Single<? extends T> t3, Single<? extends T> t4) {
        return Observable.concat(asObservable(t1), asObservable(t2), asObservable(t3), asObservable(t4));
    }

    /**
     * Returns an Observable that emits the items emitted by five Singles, one after the other.
     * <p>
     * <img width="640" height="380" src="https://raw.github.com/wiki/ReactiveX/RxJava/images/rx-operators/Single.concat.png" alt="">
     * <dl>
     * <dt><b>Scheduler:</b></dt>
     * <dd>{@code concat} does not operate by default on a particular {@link Scheduler}.</dd>
     * </dl>
     *
     * @param t1
     *            a Single to be concatenated
     * @param t2
     *            a Single to be concatenated
     * @param t3
     *            a Single to be concatenated
     * @param t4
     *            a Single to be concatenated
     * @param t5
     *            a Single to be concatenated
     * @return an Observable that emits items emitted by the five source Singles, one after the other.
     * @see <a href="http://reactivex.io/documentation/operators/concat.html">ReactiveX operators documentation: Concat</a>
     */
    public static <T> Observable<T> concat(Single<? extends T> t1, Single<? extends T> t2, Single<? extends T> t3, Single<? extends T> t4, Single<? extends T> t5) {
        return Observable.concat(asObservable(t1), asObservable(t2), asObservable(t3), asObservable(t4), asObservable(t5));
    }

`

export default javaCode;
