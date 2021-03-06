// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VertxEventBus from 'vertx3-eventbus-client'
import { EventBus } from './events.js';

Vue.config.productionTip = false

Vue.mixin({
    data() {
        return {
            get vertx_eb() {
                const vert_eb = new VertxEventBus('http://127.0.0.1:8081/sockjs');

                vert_eb.onopen = () => {
                    console.log('Server connected');
                    EventBus.$emit('app.connected');
                };
                vert_eb.onerror = (err) => {
                    console.log('Error occurred');
                    console.log(err);
                    EventBus.$emit('app.disconnected');
                };

                vert_eb.enableReconnect(true);
                return vert_eb;
            },
            get api() {
                return '127.0.0.1:8081';
            }
        }
    },
    methods: {
        request: function(action, data, callback) {
            try {
                const _data = {
                    action: action,
                    data: data
                };
                this.vertx_eb.send("api.data", _data, {}, callback);
            } catch (e) {
                console.error(e);
                callback(e, null);
            }
        }
    }
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: {App},
    template: '<App/>'
});
