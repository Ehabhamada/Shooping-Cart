const cartbtn =document.querySelector(".cart-btn");
const closCartbtn =document.querySelector(".close-cart");
const clearCartbtn =document.querySelector(".clear-cart");
const cartDOM =document.querySelector(".cart");
const cartOverlay =document.querySelector(".cart-overlay");
const cartContent =document.querySelector(".cart-content");
const cartItems =document.querySelector(".cart-items");
const cartTotal =document.querySelector(".cart-total");
const productsDOM =document.querySelector(".products-center");


//cart 
let cart=[];
let buttonsDOM = []
//getting the prouducs
class Products {
async getproducts(){
    try {
        let result = await fetch("products.json");
        let data = await result.json()

        let products = data.items;
        products =products.map(item=>{
            const {title,price}=item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return {title,price,id, image}
        })
        return products;
    } catch (error) {
        console.log(error);
        
    }
 }
}
//Display products
class UI{
displayProducts(products){
let result= '';
products.forEach(product => {
    result +=`

    <!-- single prodcut -->
    <article class="product">
        <div class="img-container">
            <img class="product-img" src=${product.image}>
            <button class="bag-btn" data-id="${product.id}">
              Add To Cart
            </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
    </article>
    <!--end  single prodcut -->
    
    `
});
productsDOM.innerHTML =result;

    };

getBagButtons(){

    const buttons =[...document.querySelectorAll(".bag-btn")];
      buttonsDOM =buttons;
     buttons.forEach(button=>{
        let id =button.dataset.id
        let inCart =cart.find(item=>item.id === id);
        if (inCart) {
            button.innerText ="In Cart";
            button.disabled = true ;

        }else{
            button.addEventListener("click",(e)=>{
                e.target.innerText = "In Cart";
                e.target.disabled = true;
                //get product
                let cartItem ={...Storage.getProduct(id),amount:1};
                //add product in cart
                cart =[...cart,cartItem];
                //save cart in localstorage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart)
                //add cart items
                this.addCartItem(cartItem)
                //show cart
                this.showCart()

            })
        }
     })


    };
    setCartValues(cart){
          let tmptotal=0
             let itemsTotal = 0
             
          cart.map((item)=>{
            tmptotal += item.price * item.amount;
            itemsTotal += item.amount;
          })
    
         cartTotal.innerText =parseFloat(tmptotal).toFixed(2)
         cartItems.innerText = itemsTotal;
    };


    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML=`
        
         <img src=${item.image} alt="product" >
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id="${item.id}">remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id="${item.id}"></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id="${item.id}"></i>
                    </div>
        
        `;
        cartContent.appendChild(div)
    };
    showCart() {
        cartOverlay.classList.add("activeoverlay");
        cartDOM.classList.add("showCart");

    };
    
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populeatCart(cart);
        cartbtn.addEventListener("click", this.showCart);
        closCartbtn.addEventListener("click", this.hideCart);   
        
    };
    populeatCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    };
    hideCart() {
        cartOverlay.classList.remove("activeoverlay");
        cartDOM.classList.remove("showCart");
    };
    cartLogic() {
        //clear cart button
        clearCartbtn.addEventListener('click', () => { this.clearCart() });
        //cart functionality
        cartContent.addEventListener("click", e => {
            if (e.target.classList.contains("remove-item"))
            {
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id)
            }else if (e.target.classList.contains("fa-chevron-up")) {
                let Addamount = e.target
                let id = Addamount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                Addamount.nextElementSibling.innerText=tempItem.amount
            } else if (e.target.classList.contains("fa-chevron-down")) {
                let loweramount = e.target
                let id = loweramount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount -= 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    loweramount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(loweramount.parentElement.parentElement)
                    this.removeItem(id)
                }
                
                
            } 
        })
    }
    clearCart() {
       let cartItems = cart.map( item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {
             cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart()
    };
    
    removeItem(id) {
    cart = cart.filter(item => item.id !== id) ;
    let button = this.getSinglebutton(id);
    button.disabled = false;
        button.innerText = `Add To Cart `;
        this.setCartValues(cart);
        Storage.saveCart(cart);
    }
    getSinglebutton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);

    };
         }
         

//loacal storage
class Storage{

 static savProducts(products){
    localStorage.setItem("products",JSON.stringify(products))
    };
   static getProduct(id) {
    let prodcut = JSON.parse(localStorage.getItem("products"));
    return prodcut.find(prodcut => prodcut.id === id)
    };
   
 static saveCart(cart){
    localStorage.setItem("cart",JSON.stringify(cart))
    };
    
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    };

};

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    //setup APP
    ui.setupAPP();
    //get all products
    products.getproducts().then(products => {
        ui.displayProducts(products);
        Storage.savProducts(products);
    }).then(() => {
        ui.getBagButtons()
        ui.cartLogic()
    });
});
