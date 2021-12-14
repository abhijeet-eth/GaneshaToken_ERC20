import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { ethers } from "ethers";
import Ganesha_JSON from "./Ganesha_JSON.json"
    
    
    const App =() => {

        const contractAddress = '0x20425607835152c3a36D96FdcF726668eF30CF7C'; 
    
        let [blockchainProvider, setBlockchainProvider] = useState(undefined);
        let [metamask, setMetamask] = useState(undefined);
        let [metamaskNetwork, setMetamaskNetwork] = useState(undefined);
        let [metamaskSigner, setMetamaskSigner] = useState(undefined);
        const [networkId, setNetworkId] = useState(undefined);
        const [loggedInAccount, setAccounts] = useState(undefined);
        const [etherBalance, setEtherBalance] = useState(undefined);
        const [isError, setError] = useState(false);
        
        const[contract, setReadContract] = useState(null);
        const[writeContract, setWriteContract] = useState(null);
        const[execute, getExecute] = useState(null);

        const [connectWallet, setConnectWallet] = useState("Connect Wallet")
        const [admin, getAdmin] = useState(undefined);
        const [minter, getMinter] = useState(undefined);
        const [pauser, getPauser] = useState(undefined);
        const [burner, getBurner] = useState(undefined);
        //For GrantRole function
        const[role, setRole] = useState(undefined);        
        const[account, setAccount] = useState(undefined);
        //Fir HasRole Function
        const[roless, setRoless] = useState(undefined);
        const[accountss, setAccountss] = useState(undefined);
        const[isTrue,setIsTrue] = useState(undefined);
        const[mintAddress,setMintAddress] = useState(undefined);
        const[mintAmount, setMintAmount] = useState(undefined);
        const[burnAddress,setBurnAddress] = useState(undefined);
        const[burnAmount, setBurnAmount] = useState(undefined);
        const[transferAddress,setTransferAddress] = useState(undefined);
        const[transferAmount, setTransferAmount] = useState(undefined);
        const[tokenSupply, setTokenSupply] = useState(undefined);
    
        let alertMessage ;
    
        const connect = async () => {
            try {
                let provider, network, metamaskProvider, signer, accounts;
    
                if (typeof window.ethereum !== 'undefined') {
                    // Connect to RPC  
                    console.log('loadNetwork')
                    try {
    
                        //console.log("acc", acc); 
                        //window.ethereum.enable();
                        //await handleAccountsChanged();
                        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                        await handleAccountsChanged(accounts);
                    } catch (err) {
                        if (err.code === 4001) {
                            // EIP-1193 userRejectedRequest error
                            // If this happens, the user rejected the connection request.
                            console.log('Please connect to MetaMask.');
                        } else {
                            console.error(err);
                        }
                    }
                    provider = new ethers.providers.JsonRpcProvider(`https://goerli.infura.io/v3/c811f30d8ce746e5a9f6eb173940e98a`)
                    // const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545")
                    setBlockchainProvider(provider);
                    network = await provider.getNetwork()
                    console.log(network.chainId);
                    setNetworkId(network.chainId);
    
                    // Connect to Metamask  
                    metamaskProvider = new ethers.providers.Web3Provider(window.ethereum)
                    setMetamask(metamaskProvider)
    
                    signer = await metamaskProvider.getSigner(accounts[0])
                    setMetamaskSigner(signer)
    
                    metamaskNetwork = await metamaskProvider.getNetwork();
                    setMetamaskNetwork(metamaskNetwork.chainId);
    
                    console.log(network);
    
                    if (network.chainId !== metamaskNetwork.chainId) {
                        alert("Your Metamask wallet is not connected to " + network.name);
    
                        setError("Metamask not connected to RPC network");
                    }
                    
                    let  tempContract = new ethers.Contract(contractAddress,Ganesha_JSON,provider);
                    setReadContract(tempContract);
                    let tempContract2 = new ethers.Contract(contractAddress,Ganesha_JSON,signer);
                    setWriteContract(tempContract2);
    
                } else setError("Could not connect to any blockchain!!");
    
                return {
                    provider, metamaskProvider, signer,
                    network: network.chainId
                }
    
            } catch (e) {
                console.error(e);
                setError(e);
            }
    
        }
    
    
        const handleAccountsChanged = async (accounts) => {
            if (typeof accounts !== "string" || accounts.length < 1) {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            }
            console.log("t1", accounts);
            if (accounts.length === 0) {
                // MetaMask is locked or the user has not connected any accounts
                alert('Please connect to MetaMask.');
            } else if (accounts[0] !== loggedInAccount) {
                setAccounts(accounts[0]);
                setConnectWallet("Wallet Connected");
            }
        }
    
        useEffect(() => {
            const init = async () => {
    
                const { provider, metamaskProvider, signer, network } = await connect();
    
                const accounts = await metamaskProvider.listAccounts();
                console.log(accounts[0]);
                setAccounts(accounts[0]);
    
                if (typeof accounts[0] == "string") {
                    setEtherBalance(String(ethers.utils.formatEther(await metamaskProvider.getBalance(accounts[0]))
                    ));
                }
            }
    
            init();
    
            window.ethereum.on('accountsChanged', handleAccountsChanged);
    
            window.ethereum.on('chainChanged', function (networkId) {
                // Time to reload your interface with the new networkId
                //window.location.reload();
                unsetStates();
            })
    
        }, []);
    
        useEffect(() => {
            (async () => {
                if (typeof metamask == 'object' && typeof metamask.getBalance == 'function'
                    && typeof loggedInAccount == "string") {
                    setEtherBalance(String(ethers.utils.formatEther(await metamask.getBalance(loggedInAccount))
                    ));
                    
                }
            })()
        }, [loggedInAccount]);
    
        const unsetStates = useCallback(() => {
            setBlockchainProvider(undefined);
            setMetamask(undefined);
            setMetamaskNetwork(undefined);
            setMetamaskSigner(undefined);
            setNetworkId(undefined);
            setAccounts(undefined);
            setEtherBalance(undefined);
        }, []);
    
        const isReady = useCallback(() => {
    
            return (
                typeof blockchainProvider !== 'undefined'
                && typeof metamask !== 'undefined'
                && typeof metamaskNetwork !== 'undefined'
                && typeof metamaskSigner !== 'undefined'
                && typeof networkId !== 'undefined'
                && typeof loggedInAccount !== 'undefined'
            );
        }, [
            blockchainProvider,
            metamask,
            metamaskNetwork,
            metamaskSigner,
            networkId,
            loggedInAccount,
        ]);    


        const checkAdmin = async() => {
            let val = await contract.admin();
             console.log(val);
             getAdmin(String(val));
        }

        const totSupply = async() => {
            let val = await contract.totalSupply();
             //console.log(val);
             setTokenSupply(String(val));     
         }

        const getMinterRole = async() => {
            let val = await contract.MINTER_ROLE();
             console.log(val);
             getMinter(String(val));     
         }

         const getPauserRole = async() => {
            let val = await contract.PAUSER_ROLE();
             console.log(val);
             getPauser(String(val));         
    
         }
         const getBurnerRole = async() => {
            let val = await contract.BURNER_ROLE();
             console.log(val);
             getBurner(String(val));                 
    
         }

         const grantRoleReq = async(role,account) =>{
            console.log(role,account);
            await writeContract.grantRole(role,account)
         }

         const checkHasRole = async(roless,accountss) =>{
            console.log(roless,accountss);
            let val =await contract.hasRoles(roless,accountss)
            console.log(val);
            setIsTrue(val);
         }

         const mintToken = async(mintAddress,mintAmount) =>{
           console.log(mintAddress,mintAmount);
            await writeContract.mint(mintAddress,mintAmount)            
         }

         const burnToken = async(burnAddress,burnAmount) =>{
            // console.log(mintAddress,accountss);
             await writeContract.burn(burnAddress,burnAmount)            
          }   
          
         const transferToken = async(transferAddress,transferAmount) =>{
            // console.log(mintAddress,accountss);
             await writeContract.transfer(transferAddress,transferAmount)            
          }

  return (
    <div className="image-erc20"> 
    <div className="App">
      <h4 className ="heading"> ERC-20 Token: Ganesha <span className ="span-edit"> (GNS) </span></h4>
            <button  type="button" className="button-42" onClick = {()=>connect()}> {connectWallet} </button>
            <h4 className ='text'>{loggedInAccount}</h4>
            <br />
            <button className = "button-42" onClick ={checkAdmin}> Admin </button>
                <h4 className ='text'>{admin}</h4>

            <button className = "button-42" onClick ={totSupply}> Total Supply </button>
            <h4 className ='text'>{tokenSupply}</h4>    

            <button className = "button-42" onClick ={getMinterRole}> Minter </button>
                <h4 className ='text'>{minter}</h4>
            <br /> 
            <button className = "button-42" onClick ={getPauserRole}> Pauser </button>
                <h4 className ='text'>{pauser}</h4>
            <br /> 
            <button className = "button-42" onClick ={getBurnerRole}> Burner </button>
                <h4 className ='text'>{burner}</h4>
                <br />

            <h2 className ='text'>Grant Role </h2>
            <form className = "input" onSubmit={grantRoleReq}>
                    <input id ='createTransfer' value= {role} onChange={(event)=>setRole(event.target.value)} type='text' placeholder ="Address of Role"/>
                    <input id ='createTransfer2' value= {account} onChange={(event)=>setAccount(event.target.value)}type='text' placeholder ="Address of Account"/>
                    <button className = "button-42" onClick={()=>grantRoleReq(role,account)} type = "button"> Submit</button>
            </form>
            <h2 className ='text'>Confirm Role</h2>
            <form className = "input" onSubmit={checkHasRole}>
                    <input id ='createTransfer' value= {roless} onChange={(event)=>setRoless(event.target.value)} type='text' placeholder ="Address of Role"/>
                    <input id ='createTransfer2' value= {accountss} onChange={(event)=>setAccountss(event.target.value)}type='text' placeholder ="Address of Account"/>
                    <button className = "button-42" onClick={()=>checkHasRole(roless,accountss)} type = "button"> Submit</button>
                    {isTrue}
            </form>

            <h2 className ='text'>Mint Token</h2>
            <form className = "input" onSubmit={mintToken}>
                    <input id ='createTransfer' value= {mintAddress} onChange={(event)=>setMintAddress(event.target.value)} type='text' placeholder ="Address"/>
                    <input id ='createTransfer2' value= {mintAmount} onChange={(event)=>setMintAmount(event.target.value)}type='number' placeholder ="Number of Tokens"/>
                    <button className = "button-42" onClick={()=>mintToken(mintAddress,mintAmount)} type = "button"> Submit</button>
                    {isTrue}
            </form>

            <h2 className ='text'>Burn Token</h2>
            <form className = "input" onSubmit={burnToken}>
                    <input id ='createTransfer' value= {burnAddress} onChange={(event)=>setBurnAddress(event.target.value)} type='text' placeholder ="Address"/>
                    <input id ='createTransfer2' value= {burnAmount} onChange={(event)=>setBurnAmount(event.target.value)}type='number' placeholder ="Amount to burn"/>
                    <button className = "button-42" onClick={()=>burnToken(burnAddress,burnAmount)} type = "button"> Submit</button>
                    {isTrue}
            </form>

            <h2 className ='text'>Transfer Token</h2>
            <form className = "input" onSubmit={transferToken}>
                    <input id ='createTransfer' value= {transferAddress} onChange={(event)=>setTransferAddress(event.target.value)} type='text' placeholder ="Address of Role"/>
                    <input id ='createTransfer2' value= {transferAmount} onChange={(event)=>setTransferAmount(event.target.value)}type='number' placeholder ="Amount to transfer"/>
                    <button className = "button-42" onClick={()=>transferToken(transferAddress,transferAmount)} type = "button"> Submit</button>
                    {isTrue}
            </form>
            <br />  


    </div>
    </div>
  );
}

export default App;
