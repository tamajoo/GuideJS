# GuideJS

## Description
GuideJS is a simple step by step guide to introduce users to features on your website.

## Demo
A simple demo is available [here](http://www.tamajoo.com/GuideJS/examples/example01.html). More demos will follow soon.

## Installation
GuideJS is implemented as a jQuery UI Widget and therefore needs jQuery and at least the jQuery UI Widget plugin installed on your website:

```html
<link href="guidejs.min.css" type="text/css" rel="stylesheet" />
<script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
<script src="guidejs-jquery.min.js"></script>
```

## How to use

### HTML
```html
<body>
	
	<div data-guidejs="1" data-guidejs-text="This is step 1.">
		This content will be focused in step 1
	</div>
	
	<div data-guidejs="2" data-guidejs-text="This is step 2.">
		This content will be focused in step 2
	</div>

</body>
```

### JavaScript
Currently calling GuideJS is only supported on the ```<body>```. In the future the possibility for multiple instances of GuideJS on different containers will be added.
```js
$(document).ready(function() {
    $("body").guidejs();
});
```

After initializing GuideJS, you can start the guide by calling the **_start_** method:
```js
$("body").guidejs("start");
```

### Methods
Currently available methods are:

| Method         | Function                                     |
| -------------- | -------------------------------------------- |
| **_start_**    | start the guide at the first step            |
| **_stop_**     | close the guide                              |
| **_continue_** | open the guide again at the last active step |
| **_next_**     | go to the next step                          |
| **_prev_**     | go to the previous step                      |

### Options
```js
options: {
    focusMode: 'self',	// 'self' or 'wrapped' | wheather to wrap the step element with a container or add GuideJS classes directly
    autostart: false,	// Start the guide right after initialization
    classes: {		// Your own CSS classes to the GuideJS elements
	btnContainer: "",
	nextBtn: "",
	prevBtn: "",
	focusContainer: "",
	infoContainer: "",
	stepText: "",
    },
    delay: null,	// Delay between steps. Defaults to the CSS transition-duration of the .gjs-ghost element
    locale: "",		// For translations. Defaults to your <html> tags "lang" attribute
    regional: {}	// Add your translations, e.g. {de: {next: "Weiter", prev: "Zurück"}}
    
    // callbacks (see next section below)
}
```

### Callbacks
You can pass several callbacks as options to control the behaviour of GuideJS:

```js
$("body").guidejs({
	beforeNext: function() {
		alert("Next step is about to be shown.");
	}
});
```

The callbacks with the prefix _before_ can prevent the execution of the corresponding functionality, if they return ```false```. E.g. in the above example, the next step would not be opened, if callback returned ```false```.

Currently available callbacks are:

| Callback      	| When is it called                                             |
| ----------------- | ------------------------------------------------------------- |
| beforeStart		| Before the guide opens.                                       |
| afterStart		| When the first step is visible to the user.                   |
| beforeNext		| Before the current step is removed and the next is shown.     |
| afterNext			| When the next step is visible to the user.                    |
| beforePrev		| Before the current step is removed and the previous is shown. |
| afterPrev			| When the previous step is visible to the user.                |
| beforeShowStep	| Before the current step is removed and another step is shown. |
| afterShowStep		| When the new step is visible to the user.                     |
| beforeStop		| Before the guide closes.                                      |
| afterStop			| When the guide is closed.                                     |
| beforeContinue	| Before the guide opens.                                       |
| afterContinue		| When the active step is visible to the user.                  |

In each callback you have access to the GuideJS widget object using ```this```.

### Events
In addition to the callbacks, GuideJS also triggers a few events on the DOM element it is called on. These are:

| Event      	      | When is it triggered                            | Arguments                           |
| ------------------- | ----------------------------------------------- | ----------------------------------- |
| guidejs.initialize  | GuideJS is about to be initialized.             | GuideJS Widget                      |
| guidejs.initialized |	After GuideJS is initialized.                   | GuideJS Widget                      |
| guidejs.step.show	  | Step is about to be shown 						| GuideJS Widget, Element to be shown |
| guidejs.step.shown  |	After the new step is visible to the user       | GuideJS Widget, Element to be shown |

### Upcoming Features
GuideJS is still heavily under construction and missing some necessary features, which will be added soon:

- Automatic positioning of the text field (so it doesn't leave the viewport)
- Better behaviour when the viewport size changes
- Responsive features
- Dynamic loading of texts (e.g. via ajax)

### Bugs, Issues and Feature Requests
For bugs and feature requests, please use [GitHub's issue tracker](https://github.com/tamajoo/GuideJS/issues/new).

For general support on how to use GuideJS, please ask your question on [Stack Overflow](https://stackoverflow.com/).
