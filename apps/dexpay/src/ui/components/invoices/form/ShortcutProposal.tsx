import { Box } from "@mui/material";
import { Button, useForm } from "dex-ui";
import { Info } from "lucide-react";
import { useAuth } from "../../../hooks/use-auth";

const ShortCutProposal = ({
  createInvoiceCallback,
  values,
}: {
  createInvoiceCallback: () => Promise<void>;
  values: InvoiceData;
}) => {
  const loader = useLoader();
  const { hideModal } = useGlobalModalContext();
  const {
    user: { project },
    invoicePreferences,
  } = useAuth();

  const prefQueryKey = [Preferences.getMy.toString()];

  const savePreferencesMutation = useMutation(Preferences.save, {
    onMutate: async () => {
      queryClient.refetchQueries({ queryKey: prefQueryKey });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: prefQueryKey });
    },
  });

  const form = useForm({
    values,
    method: async (data) => {
      if (!project?.id) {
        return;
      }
      await savePreferencesMutation.mutateAsync([
        { projectId: project.id },
        {
          converted_coin_id: data.primaryCoin.coin?.id,
          currencies: data.convertedCurrencies.map((asset) => ({
            currency_id: asset.currency.id,
          })),
        },
      ]);
      await createInvoiceCallback();
    },
  });

  const hide = () => {
    hideModal();
    loader.runLoader(createInvoiceCallback());
  };
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <Info size={60} />
      </Box>

      <Typography variant="h6" fontWeight="bold">
        Want quick creating? Create a shortcut with these coin parameters!
      </Typography>

      <Typography mt={2}>
        Primary coin - {values.primaryCoin.coin.iso}
      </Typography>
      <Typography mt={1} mb={1}>
        Supported currencies
      </Typography>
      {values.convertedCurrencies.map((i) => (
        <Chip
          key={i.iso}
          sx={{ m: 0.5, height: 45 }}
          label={<AssetItem asset={i} />}
        />
      ))}
      <Box display="flex" mt={3} justifyContent="space-between">
        <Button onClick={hide}>Cancel and continue</Button>
        <Button gradient onClick={form.submit}>
          Create shortcut
        </Button>
      </Box>
    </Box>
  );
};

export default ShortCutProposal;
