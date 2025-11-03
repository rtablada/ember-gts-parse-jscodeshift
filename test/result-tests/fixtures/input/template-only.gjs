<template>
    <div>
        <h1>Hello, World!</h1>
        <p>This is {{@varValue}}</p>

        {{#if @isActive}}
            <span>Active</span>
        {{/if}}
    </div>
</template>