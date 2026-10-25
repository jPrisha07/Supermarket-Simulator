
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

// 1. CREATE THE WORLD
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9e4d5);

// 2. CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 8);

// 3. RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

renderer.domElement.style.position = 'fixed';
renderer.domElement.style.inset = '0';
renderer.domElement.style.zIndex = '0';

// 4. LIGHTING
const ambientLight = new THREE.HemisphereLight(
    0xffffff,
    0x8b795d,
    2
);

scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 2);

mainLight.position.set(5, 10, 5);
mainLight.castShadow = true;

scene.add(mainLight);

// 5. HELPER: CREATE 3D BOXES
function createBox(width, height, depth, color, x, y, z) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });

    const box = new THREE.Mesh(geometry, material);

    box.position.set(x, y, z);
    box.castShadow = true;
    box.receiveShadow = true;

    scene.add(box);

    return box;
}

// 6. BUILD THE SUPERMARKET

// Floor
createBox(24, 0.3, 30, 0xe5d7bd, 0, -0.2, 0);

// Back wall
createBox(24, 7, 0.3, 0xfbeed7, 0, 3.3, -15);

// Side walls
createBox(0.3, 7, 30, 0xfbeed7, -12, 3.3, 0);
createBox(0.3, 7, 30, 0xfbeed7, 12, 3.3, 0);

// 7. CREATE SHELVES
function createShelf(x, z) {
    // Three shelf levels
    createBox(3, 0.2, 1.2, 0x75401c, x, 0.6, z);
    createBox(3, 0.2, 1.2, 0x75401c, x, 1.6, z);
    createBox(3, 0.2, 1.2, 0x75401c, x, 2.6, z);

    // Shelf supports
    createBox(0.15, 3, 1.2, 0x4e3100, x - 1.4, 1.5, z);
    createBox(0.15, 3, 1.2, 0x4e3100, x + 1.4, 1.5, z);
}

// Arrange the shelves
createShelf(-6, -3);
createShelf(0, -3);
createShelf(6, -3);

createShelf(-6, 4);
createShelf(0, 4);
createShelf(6, 4);

// AISLE SIGNS
function createAisleSign(text, x, z, color) {
    createBox(2.6, 0.7, 0.12, color, x, 4.5, z);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.font = "bold 46px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshBasicMaterial({
        map: texture
    });

    const signText = new THREE.Mesh(
        new THREE.PlaneGeometry(2.45, 0.61),
        material
    );

    signText.position.set(x, 4.5, z + 0.09);
    signText.renderOrder = 1;
    scene.add(signText);
}

// Signs above the two shelf rows
createAisleSign("DAIRY", -6, -3, 0x497c91);
createAisleSign("BAKERY", 0, -3, 0xa66b3f);
createAisleSign("FRUITS & VEG", 6, -3, 0x47794a);

createAisleSign("GROCERIES", -6, 4, 0x8b6bb1);
createAisleSign("SNACKS", 0, 4, 0xc85c5c);
createAisleSign("SPECIALS", 6, 4, 0x75401c);

// 8. PRODUCT DATA
const products = [
    { id: "milk", name: "Milk", price: 100, color: 0xc85c5c },
    { id: "bread", name: "Bread", price: 60, color: 0xe8c547 },
    { id: "chips", name: "Chips", price: 20, color: 0x7b9e87 },
    { id: "cereal", name: "Cereal", price: 150, color: 0x8b6bb1 },
    { id: "apples", name: "Apples", price: 200, color: 0xd98e55 },
    { id: "juice", name: "Orange Juice", price: 90, color: 0xe99435 },
    { id: "butter", name: "Butter", price: 75, color: 0xf2d56b },
    { id: "cheese", name: "Cheese", price: 130, color: 0xf0bd4e },
    { id: "yogurt", name: "Yogurt", price: 55, color: 0xe7a9c7 },
    { id: "bananas", name: "Bananas", price: 85, color: 0xf3d44f },
    { id: "strawberries", name: "Strawberries", price: 120, color: 0xc94f5d },
    { id: "tomatoes", name: "Tomatoes", price: 70, color: 0xd94d43 }
];

// Generate a random shopping list
function generateShoppingList(count = 3) {
    const availableProducts = [...products];

    for (let i = availableProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [availableProducts[i], availableProducts[j]] =
            [availableProducts[j], availableProducts[i]];
    }

    return availableProducts
        .slice(0, count)
        .map(product => product.id);
}

const ITEMS_PER_ROUND = 6;
let shoppingList = generateShoppingList(ITEMS_PER_ROUND);
const collectedItems = [];

let playerMoney = 1000;

function updateWallet() {
    const wallet = document.getElementById("wallet");

    if (wallet) {
        wallet.textContent =
            `💰 Cash: ₹${playerMoney.toFixed(2)}`;
    }
}

// 9. SHOPPING HUD
const shoppingItemsElement = document.getElementById("shopping-items");
const shoppingProgressElement = document.getElementById("shopping-progress");
const gameMessageElement = document.getElementById("game-message");

function updateShoppingHUD() {
    if (!shoppingItemsElement || !shoppingProgressElement) {
        console.warn("Shopping HUD elements are missing.");
        return;
    }

    shoppingItemsElement.innerHTML = shoppingList.map(id => {
        const product = products.find(item => item.id === id);

        if (!product) return "";

        const collected = collectedItems.includes(id);

        return `
            <div class="shopping-item ${collected ? "is-collected" : ""}">
                <span class="item-check">
                    ${collected ? "✓" : ""}
                </span>

                <span class="item-name">${product.name}</span>

                <span class="item-price">
                    ₹${product.price}
                </span>
            </div>
        `;
    }).join("");

    const completedCount = shoppingList.filter(id =>
        collectedItems.includes(id)
    ).length;

    const percentage = shoppingList.length
        ? (completedCount / shoppingList.length) * 100
        : 0;

    shoppingProgressElement.textContent =
        `${completedCount} of ${shoppingList.length} collected`;

    const progressFill = document.getElementById(
        "shopping-progress-fill"
    );

    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }

    updateWallet();
}

/*10. PRODUCT MODELS AND SHELF STOCKING*/

const physicalProducts = [];
let nearbyProduct = null;
let checkoutNearby = false;

function createProduct(productId, x, y, z) {
    const data = products.find(item => item.id === productId);
    if (!data) return null;

    const group = new THREE.Group();

    let geometry;

    if (["apples", "bananas", "strawberries", "tomatoes"].includes(productId)) {
        geometry = new THREE.SphereGeometry(0.2, 16, 12);
    } else {
        geometry = new THREE.BoxGeometry(0.38, 0.48, 0.3);
    }

    const material = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.65
    });

    const body = new THREE.Mesh(geometry, material);
    body.castShadow = true;
    body.receiveShadow = true;

    group.add(body);

    // Product label
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff8e9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#4e3100";
    ctx.font = "bold 25px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(data.name, 128, 64, 230);

    const texture = new THREE.CanvasTexture(canvas);

    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.34, 0.17),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        })
    );

    
    label.position.set(0, 0, 0.21);
    label.renderOrder = 1;
    group.add(label);


    group.position.set(x, y, z);
    group.userData.productId = productId;
    group.userData.productName = data.name;

    scene.add(group);
    physicalProducts.push(group);

    return group;
}

// Product stock assigned to specific aisles
const shelfStock = [
    {
        x: -6, z: -3,
        levels: [
            ["milk", "butter", "cheese"],
            ["yogurt", "milk", "cheese"],
            ["butter", "yogurt", "milk"]
        ]
    },
    {
        x: 0, z: -3,
        levels: [
            ["bread", "bread", "bread"],
            ["chips", "bread", "chips"],
            ["chips", "bread", "chips"]
        ]
    },
    {
        x: 6, z: -3,
        levels: [
            ["apples", "bananas", "tomatoes"],
            ["strawberries", "apples", "tomatoes"],
            ["bananas", "strawberries", "apples"]
        ]
    },
    {
        x: -6, z: 4,
        levels: [
            ["cereal", "cereal", "cereal"],
            ["juice", "cereal", "juice"],
            ["juice", "cereal", "juice"]
        ]
    },
    {
        x: 0, z: 4,
        levels: [
            ["chips", "chips", "chips"],
            ["bread", "chips", "bread"],
            ["chips", "bread", "chips"]
        ]
    },
    {
        x: 6, z: 4,
        levels: [
            ["juice", "butter", "yogurt"],
            ["cheese", "juice", "butter"],
            ["yogurt", "cheese", "juice"]
        ]
    }
];

function disposeObject3D(object) {
    object.traverse(child => {
        if (child.geometry) {
            child.geometry.dispose();
        }

        if (child.material) {
            const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

            materials.forEach(material => {
                if (material.map) material.map.dispose();
                material.dispose();
            });
        }
    });
}
function clearStoreProducts() {
    for (const product of physicalProducts) {
        scene.remove(product);
        disposeObject3D(product);
    }
    physicalProducts.length = 0;
}
function stockAllShelves() {
    clearStoreProducts();
    for (const shelf of shelfStock) {
        shelf.levels.forEach((levelProducts, levelIndex) => {
            levelProducts.forEach((productId, slotIndex) => {
                // Products sit on each shelf level
                const x = shelf.x - 0.85 + slotIndex * 0.85;
                const y = 0.91 + levelIndex * 1;
                const z = shelf.z + 0.05;

                createProduct(productId, x, y, z);
            });
        });
    }
}
function restockStore() {
    stockAllShelves();
}
// Initial stock
stockAllShelves();
/*11. SHOPPING CART*/
const cartGroup = new THREE.Group();
scene.add(cartGroup);
const cartItems = [];
// Cart basket
const cartMaterial = new THREE.MeshStandardMaterial({
    color: 0x75401c,
    metalness: 0.1,
    roughness: 0.7
});
const cartHandleMaterial = new THREE.MeshStandardMaterial({
    color: 0xdc80cb,
    roughness: 0.5
});
function cartPart(width, height, depth, material, x, y, z) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    cartGroup.add(mesh);
    return mesh;
}
// Basket base and sides
cartPart(1.05, 0.09, 0.85, cartMaterial, 0, 0.85, 0);
cartPart(1.05, 0.55, 0.08, cartMaterial, 0, 1.12, -0.39);
cartPart(1.05, 0.55, 0.08, cartMaterial, 0, 1.12, 0.39);
cartPart(0.08, 0.55, 0.85, cartMaterial, -0.49, 1.12, 0);
cartPart(0.08, 0.55, 0.85, cartMaterial, 0.49, 1.12, 0);
// Handle
cartPart(1.1, 0.09, 0.09, cartHandleMaterial, 0, 1.42, 0.53);
// Wheels
function createCartWheel(x, z) {
    const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.09, 16),
        new THREE.MeshStandardMaterial({ color: 0x292929 })
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.18, z);
    cartGroup.add(wheel);
}
createCartWheel(-0.48, -0.32);
createCartWheel(0.48, -0.32);
createCartWheel(-0.48, 0.42);
createCartWheel(0.48, 0.42);
// Add a collected product to the trolley
function addProductToCart(productId) {
    if (cartItems.length >= 10) {
        showGameMessage("Your cart is full!");
        return false;
    }
    const data = products.find(item => item.id === productId);
    if (!data) return false;
    const geometry = [
        "apples", "bananas", "strawberries", "tomatoes"
    ].includes(productId)
        ? new THREE.SphereGeometry(0.11, 10, 8)
        : new THREE.BoxGeometry(0.18, 0.22, 0.16);
    const item = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color: data.color })
    );
    const slot = cartItems.length;
    item.position.set(
        -0.28 + (slot % 3) * 0.28,
        1.15 + Math.floor(slot / 3) * 0.2,
        -0.22 + (Math.floor(slot / 3) % 2) * 0.35
    );
    item.castShadow = true;
    item.userData.homePosition = item.position.clone();
    item.userData.phase = Math.random() * Math.PI * 2;
    cartGroup.add(item);
    cartItems.push(item);
    return true;
}
// Keep the trolley in front of the player
function cartCanOccupy(x, z) {
    const halfWidth = 0.62;
    const halfDepth = 0.6;
    const bounds = player.bounds;
    if (
        x - halfWidth < bounds.minX ||
        x + halfWidth > bounds.maxX ||
        z - halfDepth < bounds.minZ ||
        z + halfDepth > bounds.maxZ
    ) {
        return false;
    }
    for (const obstacle of player.obstacles) {
        if (
            Math.abs(x - obstacle.x) < obstacle.width / 2 + halfWidth &&
            Math.abs(z - obstacle.z) < obstacle.depth / 2 + halfDepth
        ) {
            return false;
        }
    }
    return true;
}
function updateCartPosition(deltaTime) {
    const forward = new THREE.Vector3(
        -Math.sin(player.yaw),
        0,
        -Math.cos(player.yaw)
    );
    const targetX = camera.position.x + forward.x * 1.5;
    const targetZ = camera.position.z + forward.z * 1.5;
    if (cartCanOccupy(targetX, targetZ)) {
        cartGroup.position.x +=
            (targetX - cartGroup.position.x) *
            Math.min(1, deltaTime * 5);
        cartGroup.position.z +=
            (targetZ - cartGroup.position.z) *
            Math.min(1, deltaTime * 5);
    }
    cartGroup.rotation.y = player.yaw;
    // Small bounce when moving
    const moving = Object.keys(player.keys).some(key =>
        player.keys[key] &&
        ["KeyW", "KeyA", "KeyS", "KeyD"].includes(key)
    );
    for (const item of cartItems) {
        const home = item.userData.homePosition;
        item.position.y = home.y +
            (moving ? Math.abs(Math.sin(
                performance.now() * 0.008 + item.userData.phase
            )) * 0.025 : 0);
    }
}
function clearCart() {
    for (const item of [...cartItems]) {
        cartGroup.remove(item);
        disposeObject3D(item);
    }
    cartItems.length = 0;
}
/*12. GAME MESSAGES AND ROUND TIMER*/
let messageTimeout = null;
let roundActive = true;
const ROUND_LENGTH_SECONDS = 300;
let roundSecondsLeft = ROUND_LENGTH_SECONDS;
function showGameMessage(message) {
    if (!gameMessageElement) return;
    gameMessageElement.textContent = message;
    gameMessageElement.classList.add("is-visible");
    if (messageTimeout) {
        clearTimeout(messageTimeout);
    }
    messageTimeout = setTimeout(() => {
        gameMessageElement.classList.remove("is-visible");
    }, 5000);
}
// Create timer and receipt UI without needing extra HTML
const extraStyles = document.createElement("style");
extraStyles.textContent = `
    #round-timer {
        position: fixed;
        top: 18px;
        right: 20px;
        z-index: 20;
        background: #fff8e9;
        color: #75401c;
        border: 2px solid #75401c;
        border-radius: 14px;
        padding: 12px 18px;
        font: bold 18px Arial, sans-serif;
        box-shadow: 0 4px 12px #0002;
    }
    #round-timer.warning {
        color: #c0394b;
        border-color: #c0394b;
    }
    #receipt-overlay {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: #24180dcc;
        font-family: Arial, sans-serif;
    }
    #receipt-overlay.is-visible {
        display: flex;
    }
    #receipt-card {
        width: min(420px, 100%);
        max-height: 85vh;
        overflow-y: auto;
        background: #fff8e9;
        color: #75401c;
        border: 2px solid #75401c;
        border-radius: 20px;
        padding: 26px;
        box-shadow: 0 12px 40px #0004;
    }
    #receipt-card h2 {
        text-align: center;
        margin-top: 0;
    }
    .receipt-line {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 9px 0;
        border-bottom: 1px dashed #c8ad8e;
    }
    .receipt-total {
        font-size: 20px;
        font-weight: bold;
        margin-top: 18px;
    }
    .receipt-balance {
        margin-top: 10px;
    }
    #receipt-card button {
        width: 100%;
        margin-top: 22px;
        padding: 13px;
        border: none;
        border-radius: 12px;
        background: #dc80cb;
        color: #2e1402;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
    }
    #receipt-card button:hover {
        filter: brightness(1.05);
    }
    #interaction-prompt {
        position: fixed;
        left: 50%;
        bottom: 12%;
        transform: translateX(-50%);
        z-index: 20;
        padding: 12px 18px;
        border-radius: 12px;
        background: #fff8e9ee;
        color: #75401c;
        font: bold 16px Arial, sans-serif;
        text-align: center;
        pointer-events: none;
        display: none;
    }
    #interaction-prompt.is-visible {
        display: block;
    }
    #game-message.is-visible {
        display: block;
    }
    .shopping-item.is-collected .item-name {
        text-decoration: line-through;
        opacity: 0.6;
    }
    .shopping-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
    }
    .item-check {
        min-width: 18px;
        font-weight: bold;
    }
    .item-name {
        flex: 1;
    }
    #receipt-items {
        margin-top: 16px;
    }
`;
document.head.appendChild(extraStyles);
// Timer display
const timerElement = document.createElement("div");
timerElement.id = "round-timer";
document.body.appendChild(timerElement);
// Receipt overlay
const receiptOverlay = document.createElement("div");
receiptOverlay.id = "receipt-overlay";
receiptOverlay.innerHTML = `
    <div id="receipt-card">
        <h2>🛒 Your little receipt ♡</h2>
        <p style="text-align:center">
            Thank you for shopping with us!
        </p>

        <div id="receipt-items"></div>

        <div class="receipt-line receipt-total">
            <span>Total paid</span>
            <span id="receipt-total-value">₹0</span>
        </div>

        <div class="receipt-line receipt-balance">
            <span>Round balance</span>
            <span id="receipt-balance-value">₹0</span>
        </div>

        <button id="continue-shopping">
            Next round ♡
        </button>
    </div>
`;
document.body.appendChild(receiptOverlay);

const interactionPrompt = document.getElementById(
    "interaction-prompt"
) || document.createElement("div");
interactionPrompt.id = "interaction-prompt";
if (!interactionPrompt.isConnected) {
    document.body.appendChild(interactionPrompt);
}
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
}
function updateRoundTimer(deltaTime) {
    if (!roundActive) return;

    roundSecondsLeft -= deltaTime;

    if (roundSecondsLeft <= 0) {
        roundSecondsLeft = 0;
        roundActive = false;
        showTimeoutOverlay();
    }
    timerElement.textContent =
        `${formatTime(roundSecondsLeft)}`;
    timerElement.classList.toggle(
        "warning",
        roundSecondsLeft <= 60
    );
}
function showTimeoutOverlay() {
    receiptOverlay.classList.add("is-visible");
    document.querySelector("#receipt-card h2").textContent =
        "TIME IS UP!";
    document.querySelector("#receipt-card > p").textContent =
        "Ready to give it another go?";
    document.getElementById("receipt-items").innerHTML =
        `<p>You collected ${collectedItems.length} of ` +
        `${shoppingList.length} items.</p>`;
    document.getElementById("receipt-total-value").textContent = "—";
    document.getElementById("receipt-balance-value").textContent =
        `₹${playerMoney.toFixed(2)}`;
    document.getElementById("continue-shopping").textContent =
        "Try again";
}
/* 13. CHECKOUT*/
// Checkout counter
createBox(2.5, 1.1, 1.5, 0x75401c, 8.5, 0.55, 10);
createBox(2.6, 0.12, 1.6, 0xdc80cb, 8.5, 1.12, 10);
// Register screen
createBox(0.6, 0.45, 0.12, 0x497c91, 8.5, 1.45, 9.7);
// Add checkout as a collision obstacle
// The player controller below uses this list.
const checkoutObstacle = {
    x: 8.5,
    z: 10,
    width: 2.5,
    depth: 1.5
};
function checkOut() {
    if (!roundActive) return;
    const allCollected = shoppingList.every(id =>
        collectedItems.includes(id)
    );
    if (!allCollected) {
        const remaining = shoppingList.length - collectedItems.length;
        showGameMessage(
            `Almost there! You still need ${remaining} item(s).`
        );
        return;
    }
    const total = shoppingList.reduce((sum, id) => {
        const product = products.find(item => item.id === id);
        return sum + (product ? product.price : 0);
    }, 0);
    if (total > playerMoney) {
        showGameMessage("Oops! You don't have enough cash!");
        return;
    }
    playerMoney -= total;
    updateWallet();
    roundActive = false;
    const receiptItems = document.getElementById("receipt-items");
    receiptItems.innerHTML = shoppingList.map(id => {
        const product = products.find(item => item.id === id);
        if (!product) return "";
        return `
            <div class="receipt-line">
                <span>${product.name}</span>
                <span>₹${product.price.toFixed(2)}</span>
            </div>
        `;
    }).join("");
    document.getElementById("receipt-total-value").textContent =
        `₹${total.toFixed(2)}`;
    document.getElementById("receipt-balance-value").textContent =
        `₹${playerMoney.toFixed(2)}`;
    document.querySelector("#receipt-card h2").textContent =
        "🎉 Checkout complete!";
    document.querySelector("#receipt-card > p").textContent =
        "Thanks for shopping with us!";
    document.getElementById("continue-shopping").textContent =
    "Next round ♡";
    receiptOverlay.classList.add("is-visible");
    if (document.pointerLockElement === renderer.domElement) {
        document.exitPointerLock();
    }
}

function startNewRound(resetTimer = false) {
    receiptOverlay.classList.remove("is-visible");

    // Every round gets its own fresh budget
    playerMoney = 1000;

    // Only restart the timer after the previous round timed out
    if (resetTimer) {
        roundSecondsLeft = ROUND_LENGTH_SECONDS;
    }

    shoppingList = generateShoppingList(ITEMS_PER_ROUND);
    collectedItems.length = 0;

    clearCart();
    restockStore();

    roundActive = true;
    nearbyProduct = null;
    checkoutNearby = false;

    updateShoppingHUD();
    updateWallet();

    timerElement.textContent =
        `⏰ ${formatTime(roundSecondsLeft)}`;

    timerElement.classList.toggle(
        "warning",
        roundSecondsLeft <= 60
    );

    showGameMessage(
        "Fresh budget, fresh list! You have ₹1,000. 🛒"
    );
}

document.getElementById("continue-shopping").addEventListener(
    "click",
    () => {
        const timedOut = roundSecondsLeft <= 0;
        startNewRound(timedOut);
    }
);

/*14. PICKING UP PRODUCTS*/
function collectProduct() {
    if (!roundActive || !nearbyProduct) return;
    const productObject = nearbyProduct;
    const productId = productObject.userData.productId;
    if (!shoppingList.includes(productId)) {
        showGameMessage("That item isn't on your shopping list!");
        return;
    }
    if (collectedItems.includes(productId)) {
        showGameMessage("You've already collected this item!");
        return;
    }
    if (!addProductToCart(productId)) return;
    collectedItems.push(productId);
    scene.remove(productObject);
    const productIndex = physicalProducts.indexOf(productObject);
    if (productIndex !== -1) {
        physicalProducts.splice(productIndex, 1);
    }
    disposeObject3D(productObject);
    const productData = products.find(item => item.id === productId);
    updateShoppingHUD();
    updateWallet();
    const allCollected = shoppingList.every(id =>
        collectedItems.includes(id)
    );
    if (allCollected) {
        showGameMessage("You've got everything! Head to checkout! 🧾");
    } else {
        showGameMessage(`Added ${productData.name} to your cart! ♡`);
    }
    nearbyProduct = null;
    updateNearbyProduct();
}
/* 15. PLAYER CONTROLLER*/
class PlayerController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.keys = {};
        this.speed = 6;
        this.lookSpeed = 0.002;
        this.yaw = 0;
        this.pitch = 0;
        this.radius = 0.4;
        this.bounds = {
            minX: -11.2,
            maxX: 11.2,
            minZ: -14.2,
            maxZ: 14.2
        };
        this.obstacles = [
            { x: -6, z: -3, width: 3, depth: 1.2 },
            { x: 0, z: -3, width: 3, depth: 1.2 },
            { x: 6, z: -3, width: 3, depth: 1.2 },
            { x: -6, z: 4, width: 3, depth: 1.2 },
            { x: 0, z: 4, width: 3, depth: 1.2 },
            { x: 6, z: 4, width: 3, depth: 1.2 },
            checkoutObstacle
        ];
        this.domElement.addEventListener("click", () => {
            if (roundActive && !receiptOverlay.classList.contains("is-visible")) {
                this.domElement.requestPointerLock();
            }
        });
        document.addEventListener("mousemove", event => {
            if (
                document.pointerLockElement !== this.domElement ||
                !roundActive
            ) {
                return;
            }
            this.yaw -= event.movementX * this.lookSpeed;
            this.pitch -= event.movementY * this.lookSpeed;
            const limit = Math.PI / 2 - 0.05;
            this.pitch = Math.max(
                -limit,
                Math.min(limit, this.pitch)
            );
        });
        document.addEventListener("keydown", event => {
            this.keys[event.code] = true;
        });
        document.addEventListener("keyup", event => {
            this.keys[event.code] = false;
        });
        window.addEventListener("blur", () => {
            this.keys = {};
        });
    }
    canMoveTo(x, z) {
        const radius = this.radius;
        const bounds = this.bounds;
        if (
            x - radius < bounds.minX ||
            x + radius > bounds.maxX ||
            z - radius < bounds.minZ ||
            z + radius > bounds.maxZ
        ) {
            return false;
        }
        for (const obstacle of this.obstacles) {
            const closestX = Math.max(
                obstacle.x - obstacle.width / 2,
                Math.min(x, obstacle.x + obstacle.width / 2)
            );
            const closestZ = Math.max(
                obstacle.z - obstacle.depth / 2,
                Math.min(z, obstacle.z + obstacle.depth / 2)
            );
            const dx = x - closestX;
            const dz = z - closestZ;
            if (dx * dx + dz * dz < radius * radius) {
                return false;
            }
        }
        return true;
    }
    update(deltaTime) {
        this.camera.rotation.order = "YXZ";
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
        if (!roundActive) return;
        const forward = new THREE.Vector3(
            -Math.sin(this.yaw),
            0,
            -Math.cos(this.yaw)
        );
        const right = new THREE.Vector3(
            Math.cos(this.yaw),
            0,
            -Math.sin(this.yaw)
        );
        const movement = new THREE.Vector3();
        if (this.keys["KeyW"]) movement.add(forward);
        if (this.keys["KeyS"]) movement.sub(forward);
        if (this.keys["KeyD"]) movement.add(right);
        if (this.keys["KeyA"]) movement.sub(right);
        if (movement.lengthSq() > 0) {
            movement.normalize();
            const distance = this.speed * deltaTime;
            const nextX =
                this.camera.position.x + movement.x * distance;
            const nextZ =
                this.camera.position.z + movement.z * distance;
            // Separate axis checks allow sliding along shelves
            if (this.canMoveTo(nextX, this.camera.position.z)) {
                this.camera.position.x = nextX;
            }
            if (this.canMoveTo(this.camera.position.x, nextZ)) {
                this.camera.position.z = nextZ;
            }
        }
    }
}
const player = new PlayerController(camera, renderer.domElement);
/* 16. FIND NEARBY PRODUCTS AND CHECKOUT */
function updateNearbyProduct() {
    if (!roundActive) {
        nearbyProduct = null;
        checkoutNearby = false;
        interactionPrompt.classList.remove("is-visible");
        return;
    }
    const playerPosition = camera.position;
    let closestProduct = null;
    let closestDistance = 3.2;
    for (const product of physicalProducts) {
        const distance = playerPosition.distanceTo(product.position);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestProduct = product;
        }
    }
    nearbyProduct = closestProduct;
    const checkoutPosition = new THREE.Vector3(8.5, 1, 10);
    const checkoutDistance = playerPosition.distanceTo(checkoutPosition);
    checkoutNearby = checkoutDistance < 2.7;
    if (checkoutNearby) {
        interactionPrompt.textContent =
            "Press E to check out 🧾";
        interactionPrompt.classList.add("is-visible");
    } else if (nearbyProduct) {
        const data = products.find(item =>
            item.id === nearbyProduct.userData.productId
        );
        if (data && shoppingList.includes(data.id)) {
            interactionPrompt.textContent =
                `Press E to pick up ${data.name} 🛒`;
        } else if (data) {
            interactionPrompt.textContent =
                `${data.name} isn't on your list`;
        }
        interactionPrompt.classList.add("is-visible");
    } else {
        interactionPrompt.classList.remove("is-visible");
    }
}
// Press E to collect or check out
document.addEventListener("keydown", event => {
    if (event.code !== "KeyE" || event.repeat || !roundActive) {
        return;
    }
    if (checkoutNearby) {
        checkOut();
    } else {
        collectProduct();
    }
});
/* 17. INITIALISE AND START THE GAME*/
// Start the cart near the player
cartGroup.position.set(0, 0, 9.5);
updateShoppingHUD();
updateWallet();
timerElement.textContent = `⏰ ${formatTime(roundSecondsLeft)}`;
showGameMessage("Welcome to your supermarket! Find your items ♡");
// Shopping list toggle
const shoppingListButton = document.getElementById(
    "toggle-shopping-list"
);
const shoppingListPanel = document.getElementById("game-status");
if (shoppingListButton && shoppingListPanel) {
    shoppingListButton.addEventListener("click", () => {
        shoppingListPanel.classList.toggle("is-visible");
    });
}
// Main game loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = Math.min(clock.getDelta(), 0.05);
    updateRoundTimer(deltaTime);
    player.update(deltaTime);
    if (roundActive) {
        updateCartPosition(deltaTime);
        updateNearbyProduct();
    }
    renderer.render(scene, camera);}
animate();
/*18. HANDLE WINDOW RESIZING*/
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});