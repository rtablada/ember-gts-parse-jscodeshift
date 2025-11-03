import Component from '@ember/component';
import LegacyMixin from 'some-library';
import not from 'ember-truth-helpers/helpers/not';


export class VendorDetailsComponent extends Component.extend(LegacyMixin) {
	<template>
		<div>
			<h1>{{#if (not this.value)}}Hello{{/if}}, World!</h1>
			<p>This is {{@varValue}}</p>

			<span>Active</span>
		</div>
	</template>
}