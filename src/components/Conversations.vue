<template>
    <div>
        <h1>Welcome, {{user.name}}</h1>
        <p v-if="vertx_eb.state == 0" class="connect-status">connecting... <button v-on:click="logout" class="logout">logout</button></p>
        <p v-if="vertx_eb.state == 1" class="connect-status">connected <button v-on:click="logout" class="logout">logout</button></p>
        <p v-if="vertx_eb.state == 2" class="connect-status">disconnecting... <button v-on:click="logout" class="logout">logout</button></p>
        <p v-if="vertx_eb.state == 3" class="connect-status">disconnected <button v-on:click="logout" class="logout">logout</button></p>
        <div class="main">
            <contacts v-on:contacts-loaded="onContactsLoaded" v-on:open-chat="onOpenChat"></contacts>
            <chats :active_account="active_contact" :chats="messages"></chats>
        </div>
    </div>
</template>

<style>
    ul {
        text-decoration: none;
        margin: 0;
        padding: 0;
    }

    .logout {
        border: none;
        font-weight: bold;
        color: dodgerblue;
        padding: 0 32px;
        cursor: pointer;
        margin: 0 15px;
    }
    .main {
        border-radius: 6px;
        display: flex;
        flex-direction: row;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
        border-left: 1px solid #eee;
        border-top: 1px solid #eee;
        width: 800px;
        background: #ffffff;
        margin:30px auto;
    }

    .round-img {
        width: 40px;
        max-width: 100%;
        height: 40px;
        border-radius: 100%;
        border: 1px solid #eeeeee;
    }


    h1 {
        text-align: center;
        margin:30px 10px auto;
    }

    .connect-status {
        margin-left: 34px;
        margin-top: 0;
        text-align: center;
    }
</style>

<script>
    import Contacts from "./Contacts";
    import Chats from "./Chats";
    import {EventBus} from "../events";


    export default {
        components: {
            Chats,
            Contacts
        },
        name: 'conversations',
        data() {
            return {
                messages: [],
                active_contact:{},
                user: JSON.parse(localStorage.getItem('user')),
            }
        },
        methods: {
            onContactsLoaded: function (contacts)  {
                this.active_contact = contacts[0]; //First contact
                this.getConversation();
            },
            onOpenChat: function (contact) {
                //Assign the selected contact as the active contact
                //So that the conversations can be loaded
                this.active_contact = contact;
                this.getConversation();
            },
            logout: function (e) {
                e.preventDefault();
                this.request('logout', this.user, function(err, callback) {
                    if (!err) {
                    }
                });
                localStorage.removeItem('user');
                this.$router.replace('/');
            },
            getConversation: function() {
                //Assign the first loaded contact as the active contact
                const self = this;
                //Reset the content
                self.messages = [];

                const get_conversation = function() {
                    if (self.user === null || self.active_contact === null) {
                        return;//Don't execute
                    }
                    console.log(`Getting conversation for -> ${self.user.name}-${self.active_contact.name}`);
                    self.request('get-conversation', { owner : self.user, resp: self.active_contact }, (err, message) => {
                        if (err) {
                            console.log("Something happened - get-conversation");
                        } else {
                            console.log('conversation retrieved');
                            self.messages = message.body;
                        }
                    });
                };

                //Check if vertx is already connected
                if (this.vertx_eb.state === 1) {
                    get_conversation();
                } else {
                    //Wait for app to get connected
                    EventBus.$on('app.connected', () => {
                        get_conversation();
                    });
                }
            }
        }
    }
</script>