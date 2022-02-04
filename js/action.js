let userAddress = null;
let web3 = null;
const CONTRACT_ADDRESS = "0x7a4495bB988B93e866bDD28798b7bAbc762E3914";
const CONTRACT_ADDRESS_TOKEN = "0x637D434Bd827F767dC081a80b6988E2Ea22ab0eB";

window.onload = async () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        switchMetamask();
        ethereum.on('chainChanged', (chainId) => {
            window.location.reload();
        });
        if (networkId != 4) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'change to Rinkeby Test Network',
            });
            return false;
        }
        getBalanceContract();
        getFeeContract();
        getChainId();
        getDataAccount();
        getDataUser();
        document.getElementById("showMetamask").classList.add("d-none");
    } else {
        document.getElementById("showMetamask").classList.remove("d-none");
    }
    userAddress = localStorage.getItem("userAddress");
    showAddress();
    getBalanceMetamask();
};

async function loginWithMetamask() {
    if (web3 != null) {
        try {
            const selectedAccount = await ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => accounts[0]).catch(() => {
                throw Error("No account selected!");
            });
            userAddress = selectedAccount;
            localStorage.setItem("userAddress", selectedAccount);
            const networkId = await web3.eth.net.getId();
            if (networkId == 4) {
                showAddress();
                getBalanceMetamask();
                getDataUser();
            }
        } catch (error) {
            console.log(error)
        }
    }
}

function logout() {
    userAddress = null;
    localStorage.removeItem("userAddress");
    showAddress();
    getDataUser();
}

function truncateAddress(address) {
    if (!address) {
        return "";
    }
    return `${address.substr(0, 5)}...${address.substr(address.length - 5,address.length)}`;
}

function showAddress() {
    if (!userAddress) {
        document.getElementById("userAddress").innerText = "";
        document.getElementById("logoutButton").classList.add("d-none");
        document.getElementById("loginButton").classList.remove("d-none");
        document.getElementById("addressButton").classList.add("d-none");
        return false;
    }
    document.getElementById("userAddress").innerText = `${truncateAddress(userAddress)}`;
    document.getElementById("logoutButton").classList.remove("d-none");
    document.getElementById("loginButton").classList.add("d-none");
    document.getElementById("addressButton").classList.remove("d-none");
}

async function getBalanceContract() {
    const ABI = await $.getJSON("./contracts/Simple.json");
    const contract = new web3.eth.Contract(
        ABI,
        CONTRACT_ADDRESS
    );
    const ABI_TOKEN = await $.getJSON("./contracts/TokenCoin.json");
    const contract_token = new web3.eth.Contract(
        ABI_TOKEN,
        CONTRACT_ADDRESS_TOKEN
    );

    const balance = await contract.methods.getBalanceContract().call({ from: userAddress });
    document.getElementById("balance-contract").innerHTML = web3.utils.fromWei(balance, 'ether');

    const balance_token = await contract_token.methods.balanceOf(CONTRACT_ADDRESS).call({ from: CONTRACT_ADDRESS_TOKEN });
    document.getElementById("balance-token").innerHTML = numFormatter(balance_token);
}


async function getFeeContract() {
    const ABI = await $.getJSON("./contracts/Simple.json");
    const contract = new web3.eth.Contract(
        ABI,
        CONTRACT_ADDRESS
    );
    const fee = await contract.methods.getfeeContranct().call({ from: userAddress });
    document.getElementById("fee-contract").innerHTML = web3.utils.fromWei(fee, 'ether');
}

async function getDataAccount() {
    const ABI = await $.getJSON("./contracts/Simple.json");
    const contract = new web3.eth.Contract(
        ABI,
        CONTRACT_ADDRESS
    );
    const users = await contract.methods.getAllUsers().call({ from: userAddress });
    const amount = await contract.methods.getAllAmount().call({ from: userAddress });
    let total = 0;
    let _html = '';
    _html += '<tr>';
    $.each(users, function( index, value ) {
        _html += '<tr>';
            _html += '<th>'+value+'</th>';
            _html += '<th>'+Web3.utils.fromWei(amount[index].toString(), 'ether')+ " ETH"+'</th>';
        _html += '</tr>';
        total = total + parseInt(Web3.utils.fromWei(amount[index].toString(), 'ether'));
    });
    document.getElementById("render-table").innerHTML = _html;
    document.getElementById("less-fees-contract").innerHTML = total;
}

async function getDataUser() {
    const ABI = await $.getJSON("./contracts/Simple.json");
    const contract = new web3.eth.Contract(
        ABI,
        CONTRACT_ADDRESS
    );
    const ABI_TOKEN = await $.getJSON("./contracts/TokenCoin.json");
    const contract_token = new web3.eth.Contract(
        ABI_TOKEN,
        CONTRACT_ADDRESS_TOKEN
    );

    const amount_token = await contract_token.methods.balanceOf(userAddress).call({ from: CONTRACT_ADDRESS_TOKEN });

    const amount = await contract.methods.getAmountSelf().call({ from: userAddress });
    const owner = await contract.methods.getOwnerContranct().call({ from: userAddress });
    const account = await web3.eth.getAccounts();
    const fee = await contract.methods.getfeeContranct().call({ from: userAddress });
    const blocknumber = await web3.eth.getBlockNumber();
    const transaction = await web3.eth.getTransactionFromBlock(blocknumber, 0);
    const chainId = await web3.eth.getChainId();
    var script = document.createElement('script');
    script.src = "https://files.coinmarketcap.com/static/widget/currency.js";
    document.getElementById('user-detail').appendChild(script);
    let _html = '';
    _html += '<div id="user-detail" class="card">';
        _html += '<div class="card-header">Featured</div>';
        _html += '<div class="card-body">';
            _html += '<div class="row">';
                _html += '<div class="col-12 col-sm-6 col-md-3 mb-3">';
                    _html += '<ul class="list-group">';
                        if (owner != account[0]) {
                            _html += '<li class="list-group-item">Amount '+web3.utils.fromWei(amount, 'ether')+' ETH</li>';
                        } else {
                            _html += '<li class="list-group-item">Fee '+web3.utils.fromWei(fee, 'ether')+' ETH</li>';
                        }
                        _html += '<li class="list-group-item">AKT '+amount_token+' <br/><span class="buy mr-2" onclick="buyToken()">Buy</span> <span class="sell" onclick="sellToken()">Sell</span></li>';
                        _html += '<li class="list-group-item">ChainId '+chainId+'</li>';
                        _html += '<li class="list-group-item">BlockNumber '+transaction.blockNumber+'</li>';
                        _html += '<li class="list-group-item">Address <a target="_blank" href="https://rinkeby.etherscan.io/address/'+account[0]+'">'+ account[0]+'</a></li>';
                    _html += '</ul>';
                _html += '</div>';
                _html += '<div class="col-12 col-sm-12 col-md-6">';
                    _html += '<div class="row">';
                        if (owner != account[0]) {
                        _html += '<div class="col-12 col-sm-12 col-md-6">';
                            _html += '<div class="form-group">';
                                _html += '<label for="deposit">Deposit <span class="badge badge-dark">ETH</span></label>';
                                _html += '<select class="form-control" id="deposit">';
                                    _html += '<option value="2">2 ETH</option>';
                                    _html += '<option value="3">3 ETH</option>';
                                    _html += '<option value="4">4 ETH</option>';
                                    _html += '<option value="5">5 ETH</option>';
                                _html += '</select>';
                                _html += '<div onclick="desposit(this)" class="btn btn-warning mt-2">Deposit</div>';
                            _html += '</div>';
                        _html += '</div>';
                        }
                        _html += '<div class="col-12 col-sm-12 col-md-6">';
                            _html += '<div class="form-group">';
                                _html += '<label for="witdraw">Witdraw</label>';
                                _html += '<input type="text" class="form-control" id="witdraw" onkeypress="return onlyNumberKey(event)" placeholder="amount">';
                                _html += '<div onclick="witdraw(this)" class="btn btn-danger mt-2">Witdraw</div>';
                            _html += '</div>';
                        _html += '</div>';
                        if (owner != account[0]) {
                        _html += '<div class="col-12 col-sm-12 col-md-12 box-rottery">';
                            _html += '<div class="wheel" data-wheel="data-wheel">';
                                _html += '<div class="start-button" data-wheel-button="data-wheel-button">';
                                    _html += '<div class="btn-text">Start</div>';
                                _html += '</div>';
                                _html += '<div class="wheel-inner" data-wheel-inner="data-wheel-inner">';
                                    _html += '<div class="image" data-wheel-image="data-wheel-image" data-reward="1000000000000000"><span class="reward">1000000000M</span></div>';
                                    _html += '<div class="image" data-wheel-image="data-wheel-image" data-reward="500000000000000"><span class="reward">500000000M</span></div>';
                                    _html += '<div class="image" data-wheel-image="data-wheel-image" data-reward="250000000000000"><span class="reward">250000000M</span></div>';
                                    _html += '<div class="image" data-wheel-image="data-wheel-image" data-reward="125000000000000"><span class="reward">125000000M</span></div>';
                                    _html += '<div class="image" data-wheel-image="data-wheel-image" data-reward="62500000000000"><span class="reward">62500000M<span></div>';
                                    _html += '<div class="image" data-wheel-image="data-wheel-image" data-reward="31250000000000"><span class="reward">31250000M</span></div>';
                                    _html += '<div class="image" data-wheel-image="data-wheel-image" data-reward="15625000000000"><span class="reward">15625000M</span></div>';
                                    _html += '<div class="image" data-wheel-image="data-wheel-image" data-reward="7812500000000"><span class="reward">7812500M</span></div>';
                                    _html += '<div class="image" data-wheel-image="data-wheel-image" data-reward="3906250000000"><span class="reward">3906250M</span></div>';
                                    _html += '<div class="image" data-wheel-image="data-wheel-image" data-reward="0"><span class="reward">0<span></div>';
                                _html += '</div>';
                            _html += '</div>';
                        _html += '</div>';
                        }
                    _html += '</div>';
                _html += '</div>';
                _html += '<div class="col-12 col-sm-12 col-md-3">';
                    _html += '<div class="coinmarketcap-currency-widget" data-currencyid="1027" data-base="THB" data-secondary="" data-ticker="true" data-rank="true" data-marketcap="true" data-volume="true" data-statsticker="true" data-stats="USD"></div>';
                _html += '</div>';
            _html += '</div>';
        _html += '</div>';
    _html += '</div>';

    if (userAddress != null) {
        document.getElementById("user-detail").innerHTML = _html;
        if (owner != account[0]) {
            const wheel = new FortuneWheel(`[data-wheel]`, 10);
        }
    } else {
        document.getElementById("user-detail").innerHTML = "";
    }
}

async function desposit(elm) {
    elm.classList.add("disable-event");
    let amount = document.getElementById("deposit").value;
    const ABI = await $.getJSON("./contracts/Simple.json");
    const contract = new web3.eth.Contract(
        ABI,
        CONTRACT_ADDRESS
    );
    await contract.methods.deposit().send({ from: userAddress, gas: 3000000, value:web3.utils.toWei(amount, "ether") }).then(function (rs) {
        console.log(rs);
        if (rs.status) {
            Swal.fire({
                icon: 'success',
                title: 'Good job!',
                text: 'success',
            }).then((result) => {
                getDataUser();
                getDataAccount();
                getBalanceContract();
                getFeeContract();
                getBalanceMetamask();
                elm.classList.remove("disable-event");
            });
        }
    }).catch(function(error) {
        console.log(error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.message,
        });
        elm.classList.remove("disable-event");
    });
}

async function witdraw(elm) {
    elm.classList.add("disable-event");
    let amount = document.getElementById("witdraw").value;
    const ABI = await $.getJSON("./contracts/Simple.json");
    const contract = new web3.eth.Contract(
        ABI,
        CONTRACT_ADDRESS
    );
    if (amount != null && amount != undefined && amount != "" && amount > 0) {
        await contract.methods.witdraw(parseInt(amount)).send({ from: userAddress, gas: 3000000 }).then(function (rs) {
            console.log(rs);
            if (rs.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Good job!',
                    text: 'success',
                }).then((result) => {
                    getDataUser();
                    getDataAccount();
                    getBalanceContract();
                    getFeeContract();
                    getBalanceMetamask();
                    elm.classList.remove("disable-event");
                });
            }
        }).catch(function(error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.message,
            });
            elm.classList.remove("disable-event");
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please specify an amount greater than zero.!',
        });
        elm.classList.remove("disable-event");
    }
}

async function buyToken() {
    const ABI = await $.getJSON("./contracts/Simple.json");
    Swal.fire({
        title: 'Submit your ETH <div>(จำเป็นต้องฝาก ETH ก่อนซื้อ)</div>',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off',
            onkeypress: 'return onlyNumberKey(event, this)'
        },
        showCancelButton: true,
        confirmButtonText: 'Buy',
        showLoaderOnConfirm: true,
        preConfirm: (amount) => {
            const contract = new web3.eth.Contract(
                ABI,
                CONTRACT_ADDRESS
            );
            if (amount <= 0) {
                Swal.showValidationMessage('Please specify an amount greater than zero.');
            } else {
                return contract.methods.buy().send({ from: userAddress, gas: 3000000, value: web3.utils.toWei(amount, "ether")}).then(response => {
                    console.log(response.message);
                    if (response.message) {
                        throw new Error(response.status);
                    } else {
                        return true;
                    }
                }).catch(error => {
                    Swal.showValidationMessage(
                        `Request failed: ${error.message}`
                    );
                });
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            getDataUser();
            getDataAccount();
            getBalanceContract();
            getFeeContract();
            getBalanceMetamask();
            Swal.fire(
                'Good job!',
                'You clicked the button!',
                'success'
            );
        }
    });
}

async function sellToken() {
    const ABI = await $.getJSON("./contracts/Simple.json");
    const ABI_TOKEN = await $.getJSON("./contracts/TokenCoin.json");
    Swal.fire({
        title: 'Submit your AKT <div>(ครั้งละไม่เกิน 1000000000000000)</div>',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off',
            onkeypress: 'return onlyNumberKey(event, this)'
        },
        showCancelButton: true,
        confirmButtonText: 'Sell',
        showLoaderOnConfirm: true,
        preConfirm: (amount) => {
            const contract = new web3.eth.Contract(
                ABI,
                CONTRACT_ADDRESS
            );
            const contract_token = new web3.eth.Contract(
                ABI_TOKEN,
                CONTRACT_ADDRESS_TOKEN
            );
            if (amount > 0 && amount <= 1000000000000000) {
                return contract_token.methods.approve(CONTRACT_ADDRESS, parseInt(amount)).send({ from: userAddress, gas: 3000000 }).then(response => {
                    if (response.message) {
                        throw new Error(response.status);
                    } else {
                        return contract.methods.sell(parseInt(amount)).send({ from: userAddress, gas: 3000000 }).then(response => {
                            console.log(response.message);
                            if (response.message) {
                                throw new Error(response.status);
                            } else {
                                return true;
                            }
                        }).catch(error => {
                            Swal.showValidationMessage(
                                `Request failed: ${error.message}`
                            );
                        });
                    }
                }).catch(error => {
                    Swal.showValidationMessage(
                        `Request failed: ${error.message}`
                    );
                });
            } else {
                Swal.showValidationMessage('From 1 to 1000000000000000');
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            getDataUser();
            getDataAccount();
            getBalanceContract();
            getFeeContract();
            getBalanceMetamask();
            Swal.fire(
                'Good job!',
                'You clicked the button!',
                'success'
            );
        }
    });
}

async function getChainId() {
    const chainId = await web3.eth.getChainId();
    if (chainId == 4) {
        document.getElementById("chain-name").innerHTML = "Rinkeby Test Network" + " Contract : <a target='_blank' href='https://rinkeby.etherscan.io/address/"+CONTRACT_ADDRESS+"'>" + CONTRACT_ADDRESS + "</a>";
        document.getElementById("token-name").innerHTML = "Asawasak Token" + " Contract : <a target='_blank' href='https://rinkeby.etherscan.io/address/"+CONTRACT_ADDRESS_TOKEN+"'>" + CONTRACT_ADDRESS_TOKEN + "</a> อัตราแลกเปลี่ยน: 1000000000000000 AKT to 0.001 ETH";
        document.getElementById("showChain").classList.remove("d-none");
        document.getElementById("showToken").classList.remove("d-none");
    } else if (chainId == 3) {
        document.getElementById("chain-name").innerHTML ="Ropsten Test Network";
        document.getElementById("showChain").classList.remove("d-none");
    } else if (chainId == 5) {
        document.getElementById("chain-name").innerHTML ="Goerli Test Network";
        document.getElementById("showChain").classList.remove("d-none");
    } else if (chainId == 42) {
        document.getElementById("chain-name").innerHTML = "Kovan Test Network";
        document.getElementById("showChain").classList.remove("d-none");
    } else if (chainId == 1) {
        document.getElementById("chain-name").innerHTML = "Ethereum Main Network (Mainnet)";
        document.getElementById("showChain").classList.remove("d-none");
    }
}

async function getBalanceMetamask() {
    if (userAddress != null) {
        const metamaskBalance =  await web3.eth.getBalance(userAddress);
        const etherValue = Web3.utils.fromWei(metamaskBalance, 'ether');
        document.getElementById("metamaskBlanceEth").innerHTML = etherValue + " ETH";
    }
}

function switchMetamask() {
    ethereum.on('accountsChanged', (accounts) => {
        loginWithMetamask();
    });
}

function onlyNumberKey(evt, elm) {
    var self = $(elm).val();
    var ASCIICode = (evt.which) ? evt.which : evt.keyCode
    if ((ASCIICode != 46 || self.indexOf('.') != -1) && ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
        return false;
    return true;
}

function numFormatter(num) {
    if(num > 999 && num < 1000000){
        return (num/1000).toFixed(0) + 'K';
    }else if(num > 1000000){
        return (num/1000000).toFixed(0) + 'M';
    }else if(num < 900){
        return num;
    }
}

class FortuneWheel {
    constructor(selector, count) {
      this._count = count;
      this._isAnimating = false;
  
      this._wheel = document.querySelector(selector);
  
      this._button = this._wheel.querySelector(`[data-wheel-button]`);
      this._inner = this._wheel.querySelector(`[data-wheel-inner]`);
      this._images = Array.from(
        this._wheel.querySelectorAll(`[data-wheel-image]`)
      );
  
      this._button.addEventListener("click", () => {
        let self = this;
        document.querySelector("body").classList.add("disable-event");
        $.getJSON("./contracts/Mix.json", function(ABI_MIX) {
            const contract = new web3.eth.Contract(
                ABI_MIX.simple,
                CONTRACT_ADDRESS
            );
            const contract_token = new web3.eth.Contract(
                ABI_MIX.token,
                CONTRACT_ADDRESS_TOKEN
            );
            return contract_token.methods.balanceOf(userAddress).call({ from: CONTRACT_ADDRESS_TOKEN }).then(response => {
                if (response > 0) {
                    return contract_token.methods.approve(CONTRACT_ADDRESS, parseInt(3906250000000)).send({ from: userAddress, gas: 3000000 }).then(response => {
                        console.log(response);
                        if (response.message) {
                            document.querySelector("body").classList.remove("disable-event");
                            Swal.fire({
                                title: 'Oops...',
                                text: "Something went wrong!",
                                icon: 'error',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                confirmButtonText: 'Reload'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    location.reload();
                                }
                            });
                        } else {
                            return contract.methods.burning(parseInt(3906250000000)).send({ from: userAddress, gas: 3000000 }).then(response => {
                                console.log(response);
                                if (response.message) {
                                    document.querySelector("body").classList.remove("disable-event");
                                    Swal.fire({
                                        title: 'Oops...',
                                        text: "Something went wrong!",
                                        icon: 'error',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        confirmButtonText: 'Reload'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            location.reload();
                                        }
                                    });
                                } else {
                                    if (self._isAnimating === false) {
                                        self.getData(id => {
                                            self.rotate(id);
                                        });
                                    }
                                }
                            }).catch(error => {
                                document.querySelector("body").classList.remove("disable-event");
                                Swal.fire({
                                    title: 'Oops...',
                                    text: "Something went wrong!",
                                    icon: 'error',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    confirmButtonText: 'Reload'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        location.reload();
                                    }
                                });
                            });
                        }
                    }).catch(error => {
                        document.querySelector("body").classList.remove("disable-event");
                        Swal.fire({
                            title: 'Oops...',
                            text: "Something went wrong!",
                            icon: 'error',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'Reload'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                location.reload();
                            }
                        });
                    });
                } else {
                    document.querySelector("body").classList.remove("disable-event");
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: "Just buy AKT for play",
                    });
                }
            }).catch(error => {
                document.querySelector("body").classList.remove("disable-event");
                Swal.fire({
                    title: 'Oops...',
                    text: "Something went wrong!",
                    icon: 'error',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Reload'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload();
                    }
                });
            });
        });
      });
    }
  
    block() {
      this._isAnimating = true;
      this._wheel.style.pointerEvents = "none";
    }
  
    prepare() {
      this._images.forEach(image => {
        image.classList.remove("is-active");
      });
    }
  
    unblock() {
      this._isAnimating = false;
      this._wheel.style.pointerEvents = "auto";
    }
  
    rotate(id) {
      this.block();
      this.prepare();
  
      const degree = 360 * 4 - 360 / 10 * id;
  
      new TimelineMax()
        .to(this._inner, 10, {
          rotation: degree
        })
        .set(this._inner, {
          rotation: degree % 360,
          onComplete: () => {
            this.unblock();
            this._images[id].classList.add("is-active");
            if (parseInt(this._images[id].getAttribute('data-reward')) != 0) {
                let reward = parseInt(this._images[id].getAttribute('data-reward'));
                document.querySelector("body").classList.remove("disable-event");
                Swal.fire({
                    title: 'Good job!',
                    text: 'Dont Reject for Get '+ parseInt(this._images[id].getAttribute('data-reward')) +' reward',
                    icon: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed) {
                        document.querySelector("body").classList.add("disable-event");
                        $.getJSON("./contracts/Mix.json", function(ABI_MIX) {
                            const contract = new web3.eth.Contract(
                                ABI_MIX.simple,
                                CONTRACT_ADDRESS
                            );
                            return contract.methods.mining(parseInt(reward)).send({ from: userAddress, gas: 3000000 }).then(response =>{
                                console.log(response);
                                if (response.message) {
                                    document.querySelector("body").classList.remove("disable-event");
                                    Swal.fire({
                                        title: 'Oops...',
                                        text: "Something went wrong!",
                                        icon: 'error',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        confirmButtonText: 'Reload'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            location.reload();
                                        }
                                    });
                                } else {
                                    document.querySelector("body").classList.remove("disable-event");
                                    getDataUser();
                                    getDataAccount();
                                    getBalanceContract();
                                    getFeeContract();
                                    getBalanceMetamask();
                                }
                            }).catch(error => {
                                document.querySelector("body").classList.remove("disable-event");
                                Swal.fire({
                                    title: 'Oops...',
                                    text: "Something went wrong!",
                                    icon: 'error',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    confirmButtonText: 'Reload'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        location.reload();
                                    }
                                });
                            });
                        });
                    }
                });
            } else {
                document.querySelector("body").classList.remove("disable-event");
                Swal.fire({
                    title: 'Good job!',
                    text: "Sorry 0 reward",
                    icon: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Reload'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload();
                    }
                });
            }
          }
        });
    }
  
    getData(callback) {
      callback(Math.floor(Math.random() * 10));
    }
  }

