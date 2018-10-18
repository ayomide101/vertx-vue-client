<template>
    <div class="contacts-holder">
        <h4 class="header-h4">CONTACTS</h4>
        <ul class="contacts">
            <li v-for="contact in contacts" v-on:click="open_chat(contact)">
                <img class="round-img" src="../assets/logo.png">
                <div class="contact-name">
                    <h4>{{contact.name}}</h4>
                    <p>{{contact.status}}</p>
                </div>
            </li>
        </ul>
    </div>
</template>
<style scoped>
    .header-h4 {
        line-height: 50px;
        border-bottom: 1px solid #dddddd;
        margin: 0;
    }

    .contacts-holder {
        width: 300px;
        border-right: 1px solid #eeeeee;
        height: auto;
    }

    .contact-name {
        flex-grow: 1;
        margin: 0;
        padding-left: 10px;
        line-height: 10px;
        text-align: start;
    }

    .contact-name > h4 {
        margin: 0;
        line-height: 20px;
    }

    .contact-name > p {
        margin: 0;
        line-height: 20px;
        text-transform: lowercase;
    }

    .contacts {
        height: 550px;
        max-height: 550px;
        overflow-y: auto;
        text-decoration: none;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .contacts > li {
        text-align: start;
        border-bottom: 1px solid #eee;
        padding: 10px 15px;
        margin: 0;
        display: flex;
        flex-direction: row;
        transition: all 0.3s cubic-bezier(.25, .8, .25, 1);
    }

    .contacts > li:hover {
        cursor: pointer;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 1px 1px rgba(0, 0, 0, 0.23);
    }
</style>
<script>
    import {EventBus} from '../events.js';

    export default {
        name: 'contacts',
        data() {
            return {
                contacts: [],
                isAttached: false,
                user: JSON.parse(localStorage.getItem('user')),
            }
        },
        methods: {
            open_chat(contact) {
                this.$emit('open-chat', contact);
            },
            user_event_listener: function (err, message) {
                let event = message.body;
                if (event.action === "loggedin") {
                    let isExist = false;
                    this.contacts.forEach(function(contact, index) {
                        if (contact.name.toLowerCase() === event.data.name.toLowerCase()) {
                            contact.status = "online";
                            isExist = true;
                        }
                    });
                    if (!isExist) {
                        this.contacts.push(event.data);
                    }
                } else if (event.action === "loggedout") {
                    this.contacts.forEach(function(contact, index) {
                        if (contact.name.toLowerCase() === event.data.name.toLowerCase()) {
                            contact.status = "offline";
                        }
                    });
                }
            }
        },
        mounted() {
            const self = this;
            //emit event when contacts finished loading

            EventBus.$on('app.connected', () => {
                if (self.user === null) {
                    return;
                }
                self.request("get-contacts", self.user, (err, message) => {
                    if (err) {
                        console.log('Something happened');
                        console.error(err);
                    } else {
                        if (message.body === null || message.body.length <= 0) {
                            return;
                        }
                        self.contacts = message.body;
                        console.log(message.body);
                        console.log(self.contacts[0].name);
                        this.$emit('contacts-loaded', self.contacts);
                    }
                });

                if (!self.isAttached) {
                    self.vertx_eb.registerHandler("users.data", this.user_event_listener);
                    self.isAttached = true;
                }
            });
        },
        destroyed() {
            this.vertx_eb.unregisterHandler("users.data", this.user_event_listener);
        }
    }
</script>