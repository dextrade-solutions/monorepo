
const { query: currenciesQuery, data: currenciesData } = useQuery(Api.Invoice.currencies);
const { query: addressQuery } = useQuery(Api.Invoice.paymentAddress, { 
  afterSuccess: () => invoiceData({ id: query.value.id }),
  afterError: (e) => {
    if (e.message === 'Fetching rate is not available') {
      toast.add({ 
        severity: 'error',
        summary: 'Error',
        detail: `Currency ${currencies.value?.find(x => x.id === currencyChosen.value)?.iso_with_network_f} is not supported right now, please, try again in a few minutes`,
        life: 5000
      })
      invoiceData({ id: query.value.id })
    }
  },
});
