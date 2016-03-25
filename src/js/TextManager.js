export default class TextManager {
  constructor() {
    console.log('TextManager initing...');
    this.inputId = 'input';
    this.input = `anon@Geek:~$:<input id='${this.inputId}'>`;

    console.log('TextManager inited');
  }

  getMenuText() {
    const menuText =
    `Hello Neo... <br>
     Are you smart enough? <br>
    `
    return menuText;
  }

  getHelpText() {
    const helpText =
    `
    GNU bash, version 4.3.42(1)-release (x86_64-pc-linux-gnu) <br>
    These shell commands are defined internally.<br>
    Type 'help' to see this list.<br>
    help   - see help<br>
    clear  - clear console<br>
    projects - show all your project names<br>
    code <argument> - go to code<br>
    `
    return helpText;
  }

  getGameCode(project) {
    switch (project.file) {
      case 'game':
        return gameCode
      case 'js':
        return jsCode
      case 'java':
        return javaCode
      case 'cpp':
        return cppCode
      default:
        return null;
    }
  }

  getUnknownCommandText(command) {
    const unknownCommand =
    `
    No command '${command}' found, but you can type 'help'<br>
    ${command}: command not found<br>
    `
    return unknownCommand;
  }

  getUnknownArgument(commands) {
    const text =
    `
    ${commands[0]}: fatal error: unknown argument<br>
    usage: ${commands[0]} &ltargument that we know&gt<br>
    `
    return text;
  }

  getBadCommand(command) {
    let text =
    `
    Please use commands correctly! <br>
    command '${command}' is using with arguments!<br>
    `
    return text;
  }

  getInput() {
    return this.input;
  }

  getInputId() {
    return "#"+this.inputId;
  }

}

const gameCode = `
import TextManager from './TextManager';
import RenderManager from './RenderManager';
import UserStore from './UserStore';
import Typer from './Typer';

export default class GameController {
  constructor() {
    console.log('GameController initing...');

    this.textManager    = new TextManager();
    this.renderManager  = new RenderManager();
    this.typer          = new Typer(this.renderManager);
    this.user           = new UserStore();

    console.log('GameController inited.');

    this.showMenu();
  }

  showMenu() {
    console.log('Showing menu');
    const menuText = this.textManager.getMenuText();
    this.renderManager.render(menuText);
    this.showInput();
  }

  showInput() {
    const inputMd  = this.textManager.getInput();
    const inputId = this.textManager.getInputId();
    this.renderManager.renderInput(inputMd);
    this.renderManager.focus(inputId);
    this.renderManager.listenEnter(inputId, (text)=>{
      console.log('User has typed:', text);
      this.handleCommand(text);
    });
  }

  handleSimpleCommand(command) {
    switch (command) {
      case 'help':
        this.showHelp();
        break;
      case 'projects':
        this.showProjects();
        break;
      case 'clear':
        this.clear();
        break;
      case 'code':
        this.badCommand(command)
        break;
      default:
      this.unknownCommand(command);
    }
  }

  handleDoubleCommand(commands) {
    switch (commands[0]) {
      case 'code':
        this.code(commands);
        break;
      default:
        this.unknownCommand(commands[0]);
    }
  }

  handleComplexCommand(commands) {
    //@TODO: Make it normal)))
    this.renderManager.render("WTF?<br>");
    this.showInput();
  }

  handleCommand(command) {
    command = command.toLowerCase();
    command = command.split(' ');
    const inputId = this.textManager.getInputId();
    this.renderManager.saveInput(inputId, command);
    if(command.length == 1) this.handleSimpleCommand(command[0]);
    else if(command.length == 2) this.handleDoubleCommand(command);
    else if(command.length > 2) this.handleComplexCommand(command);
  }

  code(commands) {
    const projectName = commands[1];
    //@TODO: Check for project
    if(projectName !== 'game'){ this.unknownArgument(commands); }
    else {
      this.codeGame();
    }
  }

  codeGame(){
    this.renderManager.clear();
    const gameData = this.user.getGameData();
    const gameCode = this.textManager.getGameCode();
    this.typer.startTyping(gameCode, gameData);
  }

  showProjects() {
    const projects = this.textManager.getProjects();
    this.renderManager.render(projects);
    this.showInput();
  }

  clear() {
    this.renderManager.clear();
    this.showInput();
  }

  showHelp() {
    const helpText = this.textManager.getHelpText();
    this.renderManager.render(helpText);
    this.showInput();
  }

  saveGameData(gameData) {
    this.user.setGameData(gameData);
  }

  unknownCommand(command) {
    const unknownCommand = this.textManager.getUnknownCommandText(command);
    this.renderManager.render(unknownCommand);
    this.showInput();
  }

  unknownArgument(commands) {
    const unknownArgument = this.textManager.getUnknownArgument(commands);
    this.renderManager.render(unknownArgument);
    this.showInput();
  }

  badCommand(command){
    const badCommand = this.textManager.getBadCommand(command);
    this.renderManager.render(badCommand);
    this.showInput();
  }
}


import jquery from 'jquery';
import CONSTS from './consts'
var $ = jquery;
export default class RenderManager {
  constructor() {
    console.log('RenderManager initing...');

    let consoleEl = $("#console");
    this.$console = consoleEl;

    $(document).on('click', e => {
      this.focus('#input');
    })
    console.log('RenderManager inited');
  }

  focus(id) {
    $(id).focus();
  }

  listenEnter(id,cb) {
    $(id).on('keypress', (e) => {
      if(e.charCode === CONSTS.KEY_CODES.ENTER) {
        const userText = $(id).val();
        cb(userText);
      }
    })
  }

  saveInput(inputId, command) {
    if(command.length > 1) command = command.join(' ');
    $(inputId).remove()
    let html = this.$console.html();
    html += command +'<br>';
    this.$console.html(html);
  }

  renderInput(inputMd) {
    let html = this.$console.html();
    html += inputMd;
    this.$console.html(html);
  }

  render(text) {
    let html = this.$console.html();
    html += text;
    this.$console.html(html);
  }

  html(text) {
    this.$console.html(text);
  }

  getHtml() {
    return this.$console.html();
  }

  removeLastChar(length) {
    let html = this.$console.html();
    html = html.substring(0, html.length-length);
    this.$console.html(html);
  }

  clear() {
    this.$console.html("");
  }
}

export default class TextManager {
  constructor() {
    console.log('TextManager initing...');
    this.inputId = 'input';
    console.log('TextManager inited');
  }

  getMenuText() {
    const menuText =
    'Hello Neo... <br>
     Are you smart enough? <br>
    ''
    return menuText;
  }

  getProjects() {
    //@TODO: Form string from projects that inside user store
    const projects =
    '
    Projects: total: 1 <br>
    1) game : Your personal game, maybe another shit but who knows...</br>
    '
    return projects
  }

  getHelpText() {
    const helpText =
    '
    GNU bash, version 4.3.42(1)-release (x86_64-pc-linux-gnu) <br>
    These shell commands are defined internally.<br>
    Type 'help' to see this list.<br>
    help   - see help<br>
    clear  - clear console<br>
    projects - show all your project names<br>
    code <argument> - go to code<br>
    '
    return helpText;
  }

  getGameCode() {
    return gameCode;
  }

  getUnknownCommandText(command) {
    const unknownCommand ='
    No command 'command' found, but you can type 'help'<br>
    command: command not found<br>
    '
    return unknownCommand;
  }

  getUnknownArgument(commands) {
    const text =
    '
    commands[0]}: fatal error: unknown argument<br>
    usage: commands[0]} &ltargument that we know&gt<br>
    '
    return text;
  }

  getBadCommand(command) {
    let text =
    '
    Please use commands correctly! <br>
    command 'command}' is using with arguments!<br>
    '
    return text;
  }

  getInput() {
    return this.input;
  }

  getInputId() {
    return "#"+this.inputId;
  }

}

const gameCode = 'Recursion... Oh no...'

import jquery from 'jquery';
import CONST from './consts'
import gameController from './app'
var $ = jquery;
const { KEY_CODES } = CONST

export default class Typer {
  constructor(renderManager){
    console.log('Typer initing...');

    this.render = renderManager;

    this.index = 0;
    this.speed = 2;

    this.typeCodeHandler = null;
    this.shortCutsHandler = null;
    this.cursorInterval = null;
    this.lastTypedKey = null;

    console.log('Typer inited');
  }

  prepareCode(code) {
    var text=$("<div/>").text(code.substring(0, this.index)).html();

    var rtn= new RegExp("\n", "g");
    var rts= new RegExp("\\s", "g");
    var rtt= new RegExp("\\t", "g");

    return text.replace(rtn,"<br/>").replace(rtt,"&nbsp;&nbsp;&nbsp;&nbsp;").replace(rts,"&nbsp;");
  }

  deleteLastCode(e) {
    this.index -= 2*this.speed;
    this.typeCode({});
  }

  getSpeed(e) {
    if(e.keyCode === this.lastTypedKey) return 0;
    else return this.speed;
  }

  getCode() {
    return this.prepareCode(this.codeSnippet)
  }

  saveKey(e) {
    this.lastTypedKey = e.keyCode;
  }

  typeCode(e) {
    const code = this.getCode()
    this.render.html(code);
    window.scrollBy(0,50);
    this.index += this.getSpeed(e);
    this.saveKey(e);
  }

  updateCursor() {
    let content = this.render.getHtml();
    if(content.substring(content.length-1, content.length) === "|") {
      this.render.removeLastChar(1);
    }
    else {
      this.render.render('|');
    }
  }

  handleShortCut(e) {
    if(e.ctrlKey && e.keyCode == 67) {
      console.log("YEAP");
      this.stopTyping();
    }
    else if(e.keyCode == KEY_CODES.BACKSPACE) {
      this.deleteLastCode(e);
      e.preventDefault();
    }
  }

  startTyping(code, gameData) {
    this.codeSnippet = code;
    this.index = gameData.progress;

    let typeCodeHandler = this.typeCode.bind(this)
    let shortCutsHandler = this.handleShortCut.bind(this);
    let cursorInterval = setInterval(this.updateCursor.bind(this), 500);
    this.typeCodeHandler = typeCodeHandler;
    this.shortCutsHandler = shortCutsHandler;
    this.cursorInterval = cursorInterval;
    $(document).on('keypress', typeCodeHandler);
    // $(document).unbind('keydown').bind('keydown', preventBackSpace);
    $(document).on('keydown', shortCutsHandler)
  }

  stopTyping() {
    let typeCodeHandler = this.typeCodeHandler;
    let shortCutsHandler = this.shortCutsHandler;
    let cursorInterval = this.cursorInterval;
    $(document).off('keypress', typeCodeHandler)
    $(document).off('keydown', shortCutsHandler)
    clearInterval(cursorInterval);
    let gameData = {
      progress: this.index,
    }
    gameController.clear();
    gameController.saveGameData(gameData)
  }
}

`


const jsCode = `
define( [
	"./var/arr",
	"./var/document",
	"./var/slice",
	"./var/concat",
	"./var/push",
	"./var/indexOf",
	"./var/class2type",
	"./var/toString",
	"./var/hasOwn",
	"./var/support",
	"./core/DOMEval"
], function( arr, document, slice, concat,
	push, indexOf, class2type, toString, hasOwn, support, DOMEval ) {

var
	version = "@VERSION",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {

		// As of jQuery 3.0, isNumeric is limited to
		// strings and numbers (primitives or objects)
		// that can be coerced to finite numbers (gh-2662)
		var type = jQuery.type( obj );
		return ( type === "number" || type === "string" ) &&

			// parseFloat NaNs numeric-cast false positives ("")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			!isNaN( obj - parseFloat( obj ) );
	},

	isPlainObject: function( obj ) {
		var key;

		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		// Not own constructor property must be Object
		if ( obj.constructor &&
				!hasOwn.call( obj, "constructor" ) &&
				!hasOwn.call( obj.constructor.prototype || {}, "isPrototypeOf" ) ) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android<4.0 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		DOMEval( code );
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android<4.1, PhantomJS<2
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// 'in' check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}

return jQuery;
} );
`

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
