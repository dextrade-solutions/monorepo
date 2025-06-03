import { useLocation } from "react-router-dom";

function BackPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search); // Получаем параметры

  
  const requestId = queryParams.get("requestId");
  const depositWalletAddress = queryParams.get("depositWalletAddress");
  const baseCurrencyAmount = queryParams.get("baseCurrencyAmount");
  const baseCurrencyCode = queryParams.get("baseCurrencyCode");

  return (
    <div>
      <h2>Back Page</h2>
      <p><strong>requestId:</strong> {requestId || "Not set"}</p>
      <p><strong>depositWalletAddress:</strong> {depositWalletAddress || "Not set"}</p>
      <p><strong>baseCurrencyAmount:</strong> {baseCurrencyAmount || "Not set"}</p>
      <p><strong>baseCurrencyCode:</strong> {baseCurrencyCode || "Not set"}</p>      
    </div>
  );
}

export default BackPage;
