<template>
    <div class="conversation-holder">
        <div class="header">
            <img class="round-img" src="../assets/logo.png">
            <div class="contact-name">
                <h4>{{active_account.name}}</h4>
                <p>{{active_account.status}}</p>
            </div>
        </div>
        <div class="error-holder" v-if="chats.length == 0">
            <img src="../assets/logo.png"/>
            <h3>NO CONVERSATIONS</h3>
        </div>
        <ul id="chats-holder" class="chats" v-if="chats.length > 0">
            <li class="chat" v-for="(chat, index) in chats" :class="{recieve : chat.sender !== user.name }">
                <p>{{chat.message}}</p>
                <span>{{chat.time}}</span>
            </li>
        </ul>
        <div class="chat-input">
            <textarea placeholder="Enter message" v-model="message" v-on:keyup.enter="send_message"></textarea>
            <button v-on:click="send_message" v-on:keyup="typing">SEND</button>
        </div>
    </div>
</template>

<style>
    .conversation-holder {
        width: 500px;
        height: auto;
        display: flex;
        flex-direction: column;
    }

    .chats {
        height: 100%;
        max-height: 500px;
        overflow-y: auto;
        margin: 0;
        padding: 0;
        text-decoration: none;
        list-style: none;
        position: relative;
        width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        background: #f5f5f5;
    }

    .chats .chat {
        height: auto;
        width: 100%;
        text-decoration: none;
        box-sizing: border-box;
    }

    .chats .chat p {
        background: #ffffff;
        float: right;
        display:flex;
        font-size: 14px;
        line-height: 20px;
        max-width: 70%;
        padding: 8px 16px;
        text-align: left;
        overflow-wrap: break-word;
        border-radius: 4px;
        margin: 8px 16px 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    }

    .chats .chat span {
        text-align: end;
        width: 100%;
        float: right;
        font-size: 11px;
        font-weight: bold;
        margin: 0 18px 8px;
    }
    .chats .chat.recieve span {
        float:left;
        text-align: start;
    }

    .chats .chat.recieve p {
        float: left;
    }

    .header {
        border-bottom: 1px solid #dddddd;
        margin: 0;
        display: flex;
        flex-direction: row;
        padding: 0 16px;
        justify-content: center;
        align-content: center;
        align-items: center;
        min-height: 50px;
    }

    .contact-name {
        flex-grow: 1;
        margin: 0;
        padding-left: 10px;
        line-height: 10px;
        text-align: start;
        align-items: start;
        align-content: center;
        justify-content: center;
        display: flex;
        flex-direction: column;
    }

    .header > .contact-name p {
        font-size: 12px;
        line-height: normal;
        margin: 0;

    }

    .header > .contact-name h4 {
        line-height: 10px;
        margin: 0;
    }

    .header > .round-img {
        width: 35px;
        height: 35px;
    }

    .chat-input {
        height: 50px;
        border-top: 1px solid #eee;
        display: flex;
    }

    .chat-input > textarea {
        flex-grow: 1;
        border: none;
        padding: 8px 16px;
        text-align: start;
        outline: none;
        resize: none;
        font-size: 14px;
    }

    .chat-input > button {
        border: none;
        font-weight: bold;
        color: dodgerblue;
        padding: 0 15px;
        border-left: 1px solid #eee;
        border-bottom-right-radius: 6px;
        outline:none;
    }

    .chat-input > button:hover {
        background: dodgerblue;
        color: white;
        cursor: pointer;
    }

    .error-holder {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
        align-items: center;
        height: 100%;
        max-height: 100%;
        overflow: hidden;
    }

    .error-holder > img {
        max-width: 100%;
        width: 40%;
        height: auto;
        filter: grayscale(100%);
        opacity: 0.5;
    }

    .error-holder > h3 {
        text-align: center;
        color: #ddd;
    }
</style>

<script>
    export default {
        name: 'chats',
        props: {
            chats: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            active_account: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                message:'',
                user: JSON.parse(localStorage.getItem('user')),
                conversation_id :"",
                isAttached: false,
            }
        },
        methods: {
            send_message: function () {
                if (this.message.length > 0) {
                    const self = this;

                    const data = {
                        message : {
                            message:this.message,
                            sender:this.user.name,
                            time:new Date().toDateString()
                        },
                        owner : this.user,
                        resp: this.active_account
                    };

                    self.request('send-message', data, (err, message) => {
                        if (err) {
                            console.log("Message not sent");
                        } else {
                            console.log('Message sent');
//                            self.chats.push(data.message);
                        }
                    });
                    this.message = ''; //Reset message
                }
            },
            typing: function () {
                console.log('Typing');
                console.log(e);
            },
            scroll_to_end() {
                const container = this.$el.querySelector("#chats-holder");
                if (container !== null && container.scrollHeight !== null) {
                    container.scrollTop = container.scrollHeight;
                }
            },
            create_conversation_id(user_name, selected_name) {
                return "message.data." + (user_name + "-" + selected_name).toLowerCase();
            },
            listen_incoming_message() {
                const self = this;
                this.conversation_id = this.create_conversation_id(this.user.name, this.active_account.name);

                console.log('Listening for conversation -> '+this.conversation_id);

                this.vertx_eb.registerHandler(this.conversation_id, this.event_listener);
            },
            event_listener : function(error, data) {
                if (!error) {
                    console.log(data.body);
                    this.chats.push(data.body.message);
                }
            },
            stop_listening_incoming_message(oldAccount) {
                if (oldAccount !== null) {
                    const old_conversation_id = this.create_conversation_id(this.user.name, oldAccount.name);
                    console.log('removing conversation id -> ' + old_conversation_id);
                    this.vertx_eb.unregisterHandler(old_conversation_id, this.event_listener);
                }
            }
        },
        watch : {
            active_account: function (newAccount, oldAccount) {
                if (!this.isAttached) {
                    this.stop_listening_incoming_message(oldAccount);
                    this.listen_incoming_message();
                    this.isAttached = true;
                }
            }
        },
        mounted() {
            //Scroll the chat to the bottom
            this.scroll_to_end();
        },
        updated() {
            this.scroll_to_end();
        }
    }
</script>
