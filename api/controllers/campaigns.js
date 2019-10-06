"use strict";
import helpers from "../helpers";

module.exports = {
  // campaigns
  getCampaigns: async function(req, res) {
    try {
      let campaigns = await helpers.queries.campaigns.all({
        companyId: req.auth.config.companyId
      });
      res.json({ campaigns: campaigns });
    } catch (error) {
      console.log(error);
      return res.json({ error: error });
    }
  },
  // campaigns/:id
  getCampaignDetail: async function(req, res) {
    try {
      let campaignRecipients = await helpers.queries.campaigns.campaignRecipients(
        {
          campaignId: req.swagger.params.id.value
        }
      );
      let campaignEvents = await helpers.queries.campaigns.campaignEvents({
        campaignId: req.swagger.params.id.value
      });
      let recipientEvents = {};
      campaignEvents.forEach(event => {
        if (typeof recipientEvents[event.campaignRecipientId] === "undefined") {
          recipientEvents[event.campaignRecipientId] = [];
        }
        recipientEvents[event.campaignRecipientId].push({
          reviewTypeId: event.reviewTypeId,
          dateReviewed: event.dateReviewed
        });
      });
      campaignRecipients = campaignRecipients.map(recipient => {
        recipient.events = [];
        if (
          typeof recipientEvents[recipient.campaignRecipientId] !== "undefined"
        ) {
          recipient.events = recipientEvents[recipient.campaignRecipientId];
        }
        return recipient;
      });
      res.json({ campaignRecipients });
    } catch (error) {
      console.log(error);
      return res.json({ error: error });
    }
  },
  // campaigns/:id/commence
  commenceCampaign: async function(req, res) {
    try {
      let campaignInfo = await helpers.queries.campaigns.info({
        campaignId: req.swagger.params.id.value
      });
      let companyInfo = await helpers.queries.company.info({
        companyId: campaignInfo.companyId
      });
      let campaignRecipients = await helpers.queries.campaigns.campaignRecipients(
        {
          campaignId: req.swagger.params.id.value
        }
      );

      const templateData = {
        companyId: companyInfo.companyId,
        templateName: companyInfo.templateName,
        websiteUrl: companyInfo.websiteUrl,
        logoUrl: companyInfo.logoUrl,
        logoWidth: companyInfo.logoWidth,
        logoHeight: companyInfo.logoHeight,
        heading: companyInfo.emailHeading,
        subheading: companyInfo.emailSubheading,
        footer: companyInfo.emailFooter
      };

      campaignRecipients = campaignRecipients.filter(campaignRecipient => {
        return (
          campaignRecipient.dateSent === null &&
          campaignRecipient.dateUnsubscribed === null
        );
      });

      campaignRecipients.forEach(async campaignRecipient => {
        let recipientTemplateData = { ...templateData };
        recipientTemplateData.recipientId = campaignRecipient.recipientId;
        recipientTemplateData.firstName = campaignRecipient.firstName;
        recipientTemplateData.lastName = campaignRecipient.lastName;
        recipientTemplateData.email = campaignRecipient.email;

        let emailData = {
          to: [campaignRecipient.email],
          body: await helpers.template.compileTemplate(recipientTemplateData),
          subject: companyInfo.emailSubject,
          from: companyInfo.emailFrom
        };

        emailData.subject = "test";
        emailData.from = "james.mackay@gmail.com";
        helpers.template.send(emailData);
      });

      res.json({ campaignRecipients });
    } catch (error) {
      console.log(error);
      return res.json({ error: error });
    }
  }
};
