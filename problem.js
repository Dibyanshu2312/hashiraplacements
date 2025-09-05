
function baseToDecimal(value, base) {
    let result = 0;
    for (let i = 0; i < value.length; i++) {
        let digit = parseInt(value[i]);
        result = result * base + digit;
    }
    return result;
}

// Lagrange interpolation to find secret at x=0
function findSecret(shares) {
    let secret = 0;
    let n = shares.length;
    
    for (let i = 0; i < n; i++) {
        let xi = shares[i][0];  // x coordinate
        let yi = shares[i][1];  // y coordinate
        
        // Calculate Lagrange coefficient
        let coeff = 1;
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                let xj = shares[j][0];
                coeff = coeff * (0 - xj) / (xi - xj);
            }
        }
        
        secret += yi * coeff;
    }
    
    return Math.round(secret);
}

// Try all combinations of k shares from n total
function getAllCombinations(arr, k) {
    if (k === 1) return arr.map(x => [x]);
    
    let result = [];
    for (let i = 0; i <= arr.length - k; i++) {
        let smaller = getAllCombinations(arr.slice(i + 1), k - 1);
        for (let combo of smaller) {
            result.push([arr[i], ...combo]);
        }
    }
    return result;
}

// Main function
function solveShamir(jsonData) {
    let data = JSON.parse(jsonData);
    let k = data.keys.k;
    
    // Convert all shares to decimal
    let allShares = [];
    for (let key in data) {
        if (key !== 'keys') {
            let x = parseInt(key);
            let base = parseInt(data[key].base);
            let value = data[key].value;
            let y = baseToDecimal(value, base);
            allShares.push([x, y]);
            console.log(`Share ${x}: "${value}" base ${base} = ${y}`);
        }
    }
    
    // Try all combinations of k shares
    let combinations = getAllCombinations(allShares, k);
    
    for (let combo of combinations) {
        try {
            let secret = findSecret(combo);
            
            // Find wrong shares (not in this combination)
            let wrongShares = allShares.filter(share => 
                !combo.some(correct => correct[0] === share[0])
            );
            
            console.log("\n✅ SOLUTION FOUND:");
            console.log(`🔐 Secret: ${secret}`);
            console.log(`✓ Correct shares: ${combo.map(s => `(${s[0]},${s[1]})`).join(', ')}`);
            console.log(`✗ Wrong shares: ${wrongShares.map(s => `(${s[0]},${s[1]})`).join(', ')}`);
            
            return {
                secret: secret,
                correct: combo,
                wrong: wrongShares
            };
            
        } catch (e) {
            // This combination didn't work, try next
            continue;
        }
    }
    
    console.log("❌ No valid combination found");
    return null;
}

// Your input data
const inputJSON = `{
    "keys": {"n": 4, "k": 3},
    "1": {"base": "10", "value": "4"},
    "2": {"base": "2", "value": "111"},
    "3": {"base": "10", "value": "12"},
    "6": {"base": "4", "value": "213"}
}`;

// Solve it
console.log("=== Shamir Secret Sharing ===");
solveShamir(inputJSON);