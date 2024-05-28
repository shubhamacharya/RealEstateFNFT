import { Alert, IconButton, Tooltip, Typography } from "@mui/material";
import React from "react";
import WalletIcon from "@mui/icons-material/Wallet";
import detectEthereumProvider from "@metamask/detect-provider";

function Wallet() {
  const [hasProvider, setHasProvider] = React.useState(false);
  const initialState = { accounts: [] };
  const [wallet, setWallet] = React.useState(initialState);

  React.useEffect(() => {
    const refreshAccounts = (accounts) => {
      if (accounts.length > 0) {
        updateWallet(accounts);
      } else {
        setWallet(initialState);
      }
    };

    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });
      setHasProvider(Boolean(provider));

      if (provider) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        refreshAccounts(accounts);
        window.ethereum.on("accountsChanged", refreshAccounts);
      }
    };

    getProvider();
    return () => {
      window.ethereum?.removeListener("accountsChanged", refreshAccounts);
    };
  }, []);

  const updateWallet = async (accounts) => {
    setWallet({ accounts });
  };

  const hanleWalletConnection = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    updateWallet(accounts);
  };

  if (!hasProvider) {
    return (
      <Alert variant="filled" severity="error">
        Metamask Not Found. Please Install Metamask first.
      </Alert>
    );
  } else if (hasProvider && wallet.accounts.length < 1) {
    return (
      <Tooltip title="Connect Metamask Wallet">
        <IconButton
          color="inherit"
          onClick={hanleWalletConnection}
          sx={{ p: 0 }}
        >
          <WalletIcon></WalletIcon>
        </IconButton>
      </Tooltip>
    );
  } else {
    return (
      <div>
        <Typography sx={{ mt: 2, align: "right" }}>
          Connected Wallet: {wallet.accounts[0].substring(0, 6)}.....
          {wallet.accounts[0].substring(38, 42)}
        </Typography>
      </div>
    );
  }
}

export default Wallet;
