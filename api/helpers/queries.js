"use strict";
import user from "./queries/user";
import campaigns from "./queries/campaigns";
import company from "./queries/company";
import group from "./queries/group";
import locale from "./queries/locale";
import recipients from "./queries/recipients";
import reviewType from "./queries/review-type";
import subscriptionType from "./queries/subscription-type";

module.exports = {
  user: user,
  campaigns: campaigns,
  company: company,
  group: group,
  locale: locale,
  recipients: recipients,
  reviewType: reviewType,
  subscriptionType: subscriptionType
};
