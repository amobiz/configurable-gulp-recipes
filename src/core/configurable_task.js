'use strict';
var _ = require('lodash');

var Configuration = require('./configuration');
var ConfigurationError = require('./configuration_error');

var REGEX_RUNTIME_OPTIONS = /^([.#]?)([_\w][-_\s\w]*)([!?]?)$/;

var CONSTANT = {
	VISIBILITY: {
		HIDDEN: '.',
		DISABLED: '#',
		NORMAL: ''
	},
	RUNTIME: {
		PRODUCTION: '!',
		DEVELOPMENT: '?',
		ALL: ''
	}
};

function getTaskRuntimeInfo(name) {
	var match;

	name = _.trim(name);
	match = REGEX_RUNTIME_OPTIONS.exec(name);
	if (!match) {
		throw new ConfigurationError(__filename, 'invalid task name: ' + name);
	}
	return {
		name: match[2] || name,
		visibility: match[1] || '',
		runtime: match[3] || ''
	};
}

// TODO: make sure config is inherited at config time and injectable at runtime.
function createConfigurableTask(taskInfo, taskConfig, configurableRunner) {
	// invoked from stream processor
	var run = function(gulp, injectConfig, stream, done) {
		// inject and realize runtime configuration.
		var config = Configuration.realize(taskConfig, injectConfig, configurableRunner.defaults);
		return configurableRunner(gulp, config, stream, done);
	};
	// invoked from gulp
	var configurableTask = function(done) {
		return run(this, taskConfig, null, done);
	};
	configurableTask.displayName = taskInfo.name;
	configurableTask.description = taskInfo.description || configurableRunner.description;
	configurableTask.visibility = taskInfo.visibility;
	configurableTask.runtime = taskInfo.runtime;
	configurableTask.run = run;
	configurableTask.config = taskConfig;
	return configurableTask;
}

module.exports = {
	CONSTANT: CONSTANT,
	getTaskRuntimeInfo: getTaskRuntimeInfo,
	createConfigurableTask: createConfigurableTask
};
