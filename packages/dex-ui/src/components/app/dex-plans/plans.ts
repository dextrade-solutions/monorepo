export const PERSONAL_PLANS = {
  basic: {
    pricePerMonth: 0,
    aml: '1 AML check, unlimited in time',
    apiAccess: 'Up to 10,000 API credits per month',
    customerSupport: 'Email support with a 24-hour response time',
    selfCustodianProcessing: 'Not included',
  },
  optimal: {
    pricePerMonth: 25,
    aml: '10 AML checks per month',
    apiAccess: 'Up to 50,000 API credits per month',
    recommended: true,
    customerSupport: 'Priority email support with a 12-hour response time',
    selfCustodianProcessing: 'Not included',
  },
  pro: {
    pricePerMonth: 50,
    aml: '25 AML checks per month',
    apiAccess: 'Up to 100,000 API credits per month',
    customerSupport: '24/7 priority email and phone support',
    selfCustodianProcessing: 'Not included',
  },
};

export const BUSINESS_PLANS = {
  essential: {
    pricePerYear: 900,
    aml: '1,200 AML checks per year',
    apiAccess: 'Up to 300,000 API credits per month',
    customerSupport: '24/7 priority email and phone support',
    selfCustodianProcessing: 'Not included',
  },
  standard: {
    pricePerYear: 3600,
    aml: '12,000 AML checks per year',
    apiAccess: 'Up to 500,000 API credits per month',
    recommended: true,
    customerSupport: '24/7 priority email and phone support',
    selfCustodianProcessing: 'Not included',
  },
  premium: {
    pricePerYear: 12000,
    aml: '60,000 AML checks per year, Full-scale transaction monitoring and reporting, Real-time compliance checks against global watchlists, Customized AML policy implementation',
    apiAccess: 'Up to 1,000,000 API credits per month',
    customerSupport:
      '24/7 priority email and phone support, Dedicated account manager',
    selfCustodianProcessing:
      'High-security transaction processing with audit trails, Comprehensive wallet integration for a wide range of cryptocurrencies',
  },
};
