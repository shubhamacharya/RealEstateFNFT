function handleAccountsChanged(e) {
    localStorage.setItem("account", e[0]);
    window.location.reload()
}

function connect() {
    window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleAccountsChanged)
        .catch((error) => {
            if (error.code === 4001) {
                // EIP-1193 userRejectedRequest error
                console.log('Please connect to MetaMask.');
            } else {
                console.error(error);
            }
        });
}
window.ethereum.on('accountsChanged', (e) => handleAccountsChanged(e));

function requestPermissions() {
    window.ethereum
        .request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
        })
        .then((permissions) => {
            const accountsPermission = permissions.find(
                (permission) => permission.parentCapability === 'eth_accounts'
            );
            if (accountsPermission) {
                console.log('eth_accounts permission successfully requested!');
            }
        })
        .catch((error) => {
            if (error.code === 4001) {
                console.log('Permissions needed to continue.');
            } else {
                console.error(error);
            }
        });
}

module.exports = { connect }