import { HomeController as BaseHomeController, EVENT_SSAPP_HAS_LOADED, EVENT_REFRESH, EVENT_NAVIGATE_TAB } from "../../assets/pdm-web-components/index.esm.js";
export default class HomeController extends BaseHomeController{
    constructor(...args) {
        super(...args);
        let self = this;

        self.on(EVENT_SSAPP_HAS_LOADED, (evt) => {
            if (self.model.participant)
                self.showToast(`Welcome back to Finished Goods Traceability's Pharmacy App ${self.model.participant.name}`);

            const wizard = require('wizard');
            self.notificationManager = wizard.Managers.getNotificationManager(self.participantManager);
            self.notificationManager.bindController(self);
            
        }, {capture: true});

        self.on(EVENT_REFRESH, (evt) => {
            let notification = evt.detail
            console.log(notification);
            self._handleNotifications.call(self,notification);
            evt.preventDefault();
            evt.stopImmediatePropagation();
        });

        self.on(EVENT_NAVIGATE_TAB, (evt)=> {
            let notification = evt.detail;
            self._resetNotifications.call(self, notification);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self._navigateToTab.call(self, evt.detail);
        }, {capture: true})
    }

    _handleNotifications(notification){
        const self = this;

        if(notification.subject === 'batches'){
            let currentNum = Number(self.model.notifications.stockNotification);
            
            if(currentNum === NaN)
                return self.model.stockNotification = "0" 
    
            self.model.notifications.stockNotification = (currentNum + 1).toString();
        }
    }

    _resetNotifications(notification) {
        const self = this;

        if(!notification.tab)
            return

        if(notification.tab === 'tab-stock')
            self.model.notifications.stockNotification = "0";           
    }
}