<?php
/**
 * Gemma AI Connection Test Script
 * Tests Google AI (Gemma) API connectivity and functionality
 */

// Load environment variables (if using .env file)
if (file_exists('.env')) {
    $envContent = file_get_contents('.env');
    $lines = explode("\n", $envContent);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Configuration
$googleAiKey = $_ENV['VITE_GOOGLEAI_API_KEY'] ?? '';
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $googleAiKey;

// Test prompt
$testPrompt = "Hello Gemma! Please respond with a simple JSON object containing: {\"status\": \"success\", \"message\": \"Gemma AI is working correctly\", \"timestamp\": \"" . date('Y-m-d H:i:s') . "\"}";

/**
 * Test Gemma AI connectivity
 */
function testGemmaConnection($apiUrl, $testPrompt) {
    echo "🤖 Testing Gemma AI Connection...\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    // Check if API key is configured
    if (empty($GLOBALS['googleAiKey'])) {
        echo "❌ ERROR: Google AI API key not found!\n";
        echo "💡 Please set VITE_GOOGLEAI_API_KEY in your .env file\n";
        echo "🔗 Get your API key at: https://aistudio.google.com/app/apikey\n\n";
        return false;
    }
    
    echo "✅ API Key: Configured (ending with: ..." . substr($GLOBALS['googleAiKey'], -8) . ")\n";
    echo "🌐 Endpoint: " . parse_url($apiUrl, PHP_URL_HOST) . "\n";
    echo "📝 Test Prompt: " . substr($testPrompt, 0, 50) . "...\n\n";
    
    // Prepare request payload
    $requestData = [
        'contents' => [
            [
                'parts' => [
                    [
                        'text' => $testPrompt
                    ]
                ]
            ]
        ],
        'generationConfig' => [
            'maxOutputTokens' => 100,
            'temperature' => 0.1
        ]
    ];
    
    // Initialize cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'User-Agent: FSUU-Registrar-Test/1.0'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    echo "🚀 Sending request to Gemma AI...\n";
    $startTime = microtime(true);
    
    // Execute request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $responseTime = round((microtime(true) - $startTime) * 1000, 2);
    
    // Check for cURL errors
    if (curl_error($ch)) {
        echo "❌ cURL Error: " . curl_error($ch) . "\n";
        curl_close($ch);
        return false;
    }
    
    curl_close($ch);
    
    echo "⏱️  Response Time: {$responseTime}ms\n";
    echo "📊 HTTP Status: {$httpCode}\n\n";
    
    // Parse response
    if ($httpCode !== 200) {
        echo "❌ HTTP Error {$httpCode}\n";
        echo "📄 Response: " . $response . "\n\n";
        return false;
    }
    
    $responseData = json_decode($response, true);
    
    if (!$responseData) {
        echo "❌ Invalid JSON response\n";
        echo "📄 Raw Response: " . $response . "\n\n";
        return false;
    }
    
    // Extract AI response
    $aiContent = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? null;
    
    if (!$aiContent) {
        echo "❌ No content in AI response\n";
        echo "📄 Full Response: " . json_encode($responseData, JSON_PRETTY_PRINT) . "\n\n";
        return false;
    }
    
    echo "✅ Connection Successful!\n";
    echo "🤖 Gemma Response: " . trim($aiContent) . "\n\n";
    
    // Try to parse as JSON
    $aiJson = json_decode($aiContent, true);
    if ($aiJson && isset($aiJson['status'])) {
        echo "✅ JSON Parsing: Success\n";
        echo "📋 Status: " . $aiJson['status'] . "\n";
        echo "💬 Message: " . $aiJson['message'] . "\n";
        if (isset($aiJson['timestamp'])) {
            echo "⏰ Timestamp: " . $aiJson['timestamp'] . "\n";
        }
    } else {
        echo "⚠️  JSON Parsing: Failed (AI responded with plain text)\n";
    }
    
    return true;
}

/**
 * Test with a sample image (Base64 encoded small test image)
 */
function testGemmaImageAnalysis($apiUrl) {
    echo "\n🖼️  Testing Gemma Image Analysis...\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    // Small test image (1x1 pixel red PNG encoded in base64)
    $testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAWA0+XwAAAABJRU5ErkJggg==';
    
    $imagePrompt = "Analyze this test image and respond with: {\"image_detected\": true, \"message\": \"Image analysis working\"}";
    
    $requestData = [
        'contents' => [
            [
                'parts' => [
                    [
                        'text' => $imagePrompt
                    ],
                    [
                        'inlineData' => [
                            'mimeType' => 'image/png',
                            'data' => $testImageBase64
                        ]
                    ]
                ]
            ]
        ],
        'generationConfig' => [
            'maxOutputTokens' => 100,
            'temperature' => 0.1
        ]
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'User-Agent: FSUU-Registrar-Image-Test/1.0'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_TIMEOUT, 45);
    
    echo "🚀 Sending image analysis request...\n";
    $startTime = microtime(true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $responseTime = round((microtime(true) - $startTime) * 1000, 2);
    
    if (curl_error($ch)) {
        echo "❌ cURL Error: " . curl_error($ch) . "\n";
        curl_close($ch);
        return false;
    }
    
    curl_close($ch);
    
    echo "⏱️  Response Time: {$responseTime}ms\n";
    echo "📊 HTTP Status: {$httpCode}\n\n";
    
    if ($httpCode !== 200) {
        echo "❌ Image Analysis Failed (HTTP {$httpCode})\n";
        echo "📄 Response: " . $response . "\n\n";
        return false;
    }
    
    $responseData = json_decode($response, true);
    $aiContent = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? null;
    
    if ($aiContent) {
        echo "✅ Image Analysis Successful!\n";
        echo "🤖 Response: " . trim($aiContent) . "\n\n";
        return true;
    } else {
        echo "❌ No response from image analysis\n";
        return false;
    }
}

/**
 * Main test execution
 */
function runGemmaTests() {
    echo "\n";
    echo "🧪 FSUU REGISTRAR - GEMMA AI CONNECTION TEST\n";
    echo "═══════════════════════════════════════════════════════════════\n";
    echo "📅 Test Date: " . date('Y-m-d H:i:s') . "\n";
    echo "🖥️  PHP Version: " . PHP_VERSION . "\n";
    echo "🌐 cURL Version: " . curl_version()['version'] . "\n\n";
    
    $allTestsPassed = true;
    
    // Test 1: Basic connection
    if (!testGemmaConnection($GLOBALS['apiUrl'], $GLOBALS['testPrompt'])) {
        $allTestsPassed = false;
    }
    
    // Test 2: Image analysis (if basic connection works)
    if ($allTestsPassed) {
        if (!testGemmaImageAnalysis($GLOBALS['apiUrl'])) {
            $allTestsPassed = false;
        }
    }
    
    // Final results
    echo "\n";
    echo "🏁 TEST RESULTS\n";
    echo "═══════════════════════════════════════════════════════════════\n";
    
    if ($allTestsPassed) {
        echo "✅ ALL TESTS PASSED!\n";
        echo "🎉 Gemma AI is working correctly in your FSUU Registrar system\n";
        echo "💡 You can now use Gemma AI for profile image analysis\n";
    } else {
        echo "❌ SOME TESTS FAILED\n";
        echo "🔧 Please check your configuration and try again\n";
        echo "📋 Common issues:\n";
        echo "   • Invalid API key\n";
        echo "   • Network connectivity problems\n";
        echo "   • API rate limits\n";
        echo "   • Incorrect environment variables\n";
    }
    
    echo "\n📚 For help, check: DUAL_AI_IMPLEMENTATION.md\n";
    echo "═══════════════════════════════════════════════════════════════\n\n";
}

// Execute tests
runGemmaTests();
?>