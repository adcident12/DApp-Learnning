let userAddress = null;
let web3 = null;
// const CONTRACT_ADDRESS = "0x7a4495bB988B93e866bDD28798b7bAbc762E3914";
// const CONTRACT_ADDRESS_TOKEN = "0x637D434Bd827F767dC081a80b6988E2Ea22ab0eB";
const CONTRACT_ADDRESS = "0x4Fe45511460cd10DCb78a438EfE25283eBDc9C64";
const CONTRACT_ADDRESS_TOKEN = "0x90e21d29522d6cf3323166dd9661188a4db77d64";

window.onload = async () => {
    userAddress = localStorage.getItem("userAddress");
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
                title: 'ผิดพลาด',
                text: 'เปลี่ยน network ใน metamask เป็น Rinkeby Test Network',
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
    if (userAddress != null) {
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
        _html += '<div class="card">';
            _html += '<div class="card-header">เครื่องมือ</div>';
            _html += '<div class="card-body">';
                _html += '<div class="row">';
                    _html += '<div class="col-12 col-sm-6 col-md-3 mb-3">';
                        _html += '<ul class="list-group">';
                            if (owner != account[0]) {
                                _html += '<li class="list-group-item">ยอดที่ฝาก '+web3.utils.fromWei(amount, 'ether')+' ETH <br/><span onclick="InterestToken()" class="get-fee">รับดอกเบี้ย<span><span class="badge badge-primary ml-2">AKT</span></li>';
                            } else {
                                _html += '<li class="list-group-item">ยอดที่ถอดได้ '+web3.utils.fromWei(fee, 'ether')+' ETH</li>';
                            }
                            if (owner != account[0]) {
                                _html += '<li class="list-group-item">AKT '+amount_token+' <br/><span class="buy mr-2" onclick="buyToken()">ซื้อ</span> <span class="sell" onclick="sellToken()">ขาย</span></li>';
                            }
                            _html += '<li class="list-group-item">เลข Chain '+chainId+'</li>';
                            _html += '<li class="list-group-item">เลข Block '+transaction.blockNumber+'</li>';
                            _html += '<li class="list-group-item">ที่อยู่กระเป๋า <a target="_blank" href="https://rinkeby.etherscan.io/address/'+account[0]+'">'+ account[0]+'</a></li>';
                        _html += '</ul>';
                    _html += '</div>';
                    _html += '<div class="col-12 col-sm-12 col-md-6">';
                        _html += '<div class="row">';
                            if (owner != account[0]) {
                            _html += '<div class="col-12 col-sm-12 col-md-6">';
                                _html += '<div class="form-group">';
                                    _html += '<label for="deposit">การฝาก <span class="badge badge-dark">ETH</span></label>';
                                    _html += '<select class="form-control" id="deposit">';
                                        _html += '<option value="2">2 ETH</option>';
                                        _html += '<option value="3">3 ETH</option>';
                                        _html += '<option value="4">4 ETH</option>';
                                        _html += '<option value="5">5 ETH</option>';
                                    _html += '</select>';
                                    _html += '<div onclick="desposit(this)" class="btn btn-warning mt-2">ยืนยันการฝาก</div>';
                                _html += '</div>';
                            _html += '</div>';
                            }
                            _html += '<div class="col-12 col-sm-12 col-md-6">';
                                _html += '<div class="form-group">';
                                    _html += '<label for="witdraw">การถอด</label>';
                                    _html += '<input type="text" class="form-control" id="witdraw" onkeypress="return onlyNumberKey(event)" placeholder="amount">';
                                    _html += '<div onclick="witdraw(this)" class="btn btn-danger mt-2">ยืนยันการถอด</div>';
                                _html += '</div>';
                            _html += '</div>';
                            if (owner != account[0]) {
                            _html += '<div class="col-12 col-sm-12 col-md-12 box-rottery">';
                                _html += '<div class="wheel" data-wheel="data-wheel">';
                                    _html += '<div class="start-button" data-wheel-button="data-wheel-button">';
                                        _html += '<div class="btn-text">Start</div>';
                                    _html += '</div>';
                                    _html += '<div class="wheel-inner" data-wheel-inner="data-wheel-inner">';
                                        _html += '<div class="image" data-wheel-image="data-wheel-image"><span class="reward">1000000000M</span></div>';
                                        _html += '<div class="image" data-wheel-image="data-wheel-image"><span class="reward">500000000M</span></div>';
                                        _html += '<div class="image" data-wheel-image="data-wheel-image"><span class="reward">250000000M</span></div>';
                                        _html += '<div class="image" data-wheel-image="data-wheel-image"><span class="reward">125000000M</span></div>';
                                        _html += '<div class="image" data-wheel-image="data-wheel-image"><span class="reward">62500000M<span></div>';
                                        _html += '<div class="image" data-wheel-image="data-wheel-image"><span class="reward">31250000M</span></div>';
                                        _html += '<div class="image" data-wheel-image="data-wheel-image"><span class="reward">15625000M</span></div>';
                                        _html += '<div class="image" data-wheel-image="data-wheel-image"><span class="reward">7812500M</span></div>';
                                        _html += '<div class="image" data-wheel-image="data-wheel-image"><span class="reward">3906250M</span></div>';
                                        _html += '<div class="image" data-wheel-image="data-wheel-image"><span class="reward">0<span></div>';
                                    _html += '</div>';
                                _html += '</div>';
                                _html += '<div class="bar-bottom badge badge-warning">เสีย AKT ครั้งละ 3906250000000 ต่อการหมุน</div>';
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
                title: 'ยินดีด้วย!',
                text: 'สำเร็จ',
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
            title: 'ผิดพลาด',
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
                    title: 'ยินดีด้วย!',
                    text: 'สำเร็จ',
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
                title: 'ผิดพลาด',
                text: error.message,
            });
            elm.classList.remove("disable-event");
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: 'โปรดระบุจำนวนเงินที่มากกว่าศูนย์!',
        });
        elm.classList.remove("disable-event");
    }
}

async function buyToken() {
    const ABI = await $.getJSON("./contracts/Simple.json");
    Swal.fire({
        title: 'กรอก ETH ของคุณ<div>(จำเป็นต้องฝาก ETH ก่อนซื้อ)</div>',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off',
            onkeypress: 'return onlyNumberKey(event, this)'
        },
        showCancelButton: true,
        confirmButtonText: 'ซื้อ',
        cancelButtonText: 'ยกเลิก',
        showLoaderOnConfirm: true,
        preConfirm: (amount) => {
            const contract = new web3.eth.Contract(
                ABI,
                CONTRACT_ADDRESS
            );
            if (amount <= 0) {
                Swal.showValidationMessage('โปรดระบุจำนวนเงินที่มากกว่าศูนย์!');
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
                'ยินดีด้วย!',
                'คลิกที่ปุ่ม!',
                'success'
            );
        }
    });
}

async function sellToken() {
    const ABI = await $.getJSON("./contracts/Simple.json");
    const ABI_TOKEN = await $.getJSON("./contracts/TokenCoin.json");
    Swal.fire({
        title: 'กรอก AKT ของคุณ<div>(ครั้งละไม่เกิน 1000000000000000)</div>',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off',
            onkeypress: 'return onlyNumberKey(event, this)'
        },
        showCancelButton: true,
        confirmButtonText: 'ขาย',
        cancelButtonText: 'ยกเลิก',
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
                Swal.showValidationMessage('ใส่จำนวน 1 ถึง 1000000000000000000');
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
                'ยินดีด้วย!',
                'คลิกที่ปุ่ม!',
                'success'
            );
        }
    });
}

async function InterestToken() {
    if (userAddress != null) {
        const ABI = await $.getJSON("./contracts/Simple.json");
        const contract = new web3.eth.Contract(
            ABI,
            CONTRACT_ADDRESS
        );
        const despositFirst = await contract.methods.getTimestampSelf().call({ from: userAddress });
        let showDate = "ยังไม่ได้ฝากหรือถอดออกหมดแล้ว";
        if (despositFirst != 0) {
            showDate = timeDifference(new Date(), new Date(despositFirst * 1000));
        }
        Swal.fire({
            title: 'คุณแน่ใจไหม?',
            html: "จะรับได้ก็ต่อเมื่อฝากเกิน 30 วัน!<br/>ตอนนี้คุณ" +showDate,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก'
          }).then((result) => {
            if (result.isConfirmed) {
                return contract.methods.interest().send({ from: userAddress, gas: 3000000 }).then(response => {
                    console.log(response.message);
                    if (response.message) {
                        Swal.fire({
                            icon: 'error',
                            title: 'ผิดพลาด',
                            text: response.message,
                        });
                    } else {
                        Swal.fire(
                            'ยินดีด้วย!',
                            'รับดอกเบี้ยแล้ว!',
                            'success'
                        );
                        getDataUser();
                        getDataAccount();
                        getBalanceContract();
                        getFeeContract();
                        getBalanceMetamask();
                    }
                }).catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'ผิดพลาด',
                        text: error.message,
                    });
                });
            }
        });
    }
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
                                title: 'ผิดพลาด',
                                text: "อะไรบางอย่างผิดปกติ!",
                                icon: 'error',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                confirmButtonText: 'โหลดใหม่'
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
                                        title: 'ผิดพลาด',
                                        text: "อะไรบางอย่างผิดปกติ!",
                                        icon: 'error',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        confirmButtonText: 'โหลดใหม่'
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
                                    title: 'ผิดพลาด',
                                    text: "อะไรบางอย่างผิดปกติ!",
                                    icon: 'error',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    confirmButtonText: 'โหลดใหม่'
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
                            title: 'ผิดพลาด',
                            text: "อะไรบางอย่างผิดปกติ!",
                            icon: 'error',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'โหลดใหม่'
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
                        title: 'ผิดพลาด',
                        text: "ซื้อ AKT เพื่อเล่น",
                    });
                }
            }).catch(error => {
                document.querySelector("body").classList.remove("disable-event");
                Swal.fire({
                    title: 'ผิดพลาด',
                    text: "อะไรบางอย่างผิดปกติ!",
                    icon: 'error',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'โหลดใหม่'
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
                let arrayReward = [
                    '1000000000000000',
                    '500000000000000',
                    '250000000000000',
                    '125000000000000',
                    '62500000000000',
                    '31250000000000',
                    '15625000000000',
                    '7812500000000',
                    '3906250000000',
                    '0'
                ];
                let reward = arrayReward[id];
                console.log(reward, id);
                document.querySelector("body").classList.remove("disable-event");
                Swal.fire({
                    title: 'ยินดีด้วย!',
                    text: 'กด confirm กระเป๋า เพื่อรับ '+ parseInt(reward) +' เหรียญ',
                    icon: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'ตกลง'
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
                                        title: 'ผิดพลาด',
                                        text: "อะไรบางอย่างผิดปกติ!",
                                        icon: 'error',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        confirmButtonText: 'โหลดใหม่'
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
                                    title: 'ผิดพลาด',
                                    text: "อะไรบางอย่างผิดปกติ!",
                                    icon: 'error',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    confirmButtonText: 'โหลดใหม่'
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
                    title: 'ยินดีด้วย!',
                    text: "รับ 0 เหรียญ",
                    icon: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'โหลดใหม่'
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

function timeDifference(date1,date2) {
    var difference = date1.getTime() - date2.getTime();

    var daysDifference = Math.floor(difference/1000/60/60/24);
    difference -= daysDifference*1000*60*60*24

    var hoursDifference = Math.floor(difference/1000/60/60);
    difference -= hoursDifference*1000*60*60

    var minutesDifference = Math.floor(difference/1000/60);
    difference -= minutesDifference*1000*60

    var secondsDifference = Math.floor(difference/1000);

    return 'ฝากไป ' + daysDifference + ' วัน ' + hoursDifference + ' ชั่วโมง ' + minutesDifference + ' นาที ' + secondsDifference + ' วินาที ';
}