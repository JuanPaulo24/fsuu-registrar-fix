import {
    azureTargetUrl,
    azureOpenaiVersion,
    azureOpenaiModel,
    azureOpenaiDeployment,
    azureOpenaiKey,
    googleAiKey
} from "./appConfig";
import profileImageScanPrompt from "./Aiprompt";

/**
 * Dual AI Service with Gemma priority and OpenAI fallback
 * For image analysis and profile data extraction
 */
class DualAiService {
    constructor() {
        // Initialize configuration errors
        this.gemmaConfigError = null;
        this.openaiConfigError = null;

        // Validate Gemma configuration
        if (!googleAiKey) {
            this.gemmaConfigError = 'Google AI (Gemma) configuration is incomplete. Missing API key.';
            console.warn('⚠️ Gemma AI not configured:', this.gemmaConfigError);
        }

        // Validate OpenAI configuration
        if (!azureTargetUrl || !azureOpenaiKey || !azureOpenaiVersion || !azureOpenaiDeployment) {
            this.openaiConfigError = 'Azure OpenAI configuration is incomplete. Please check your .env file.';
            console.warn('⚠️ OpenAI not configured:', this.openaiConfigError);
        }

        // Check if at least one AI service is available
        if (this.gemmaConfigError && this.openaiConfigError) {
            console.error('❌ No AI services configured! Both Gemma and OpenAI are unavailable.');
        } else {
            console.log('✅ Dual AI Service initialized:', {
                gemmaAvailable: !this.gemmaConfigError,
                openaiAvailable: !this.openaiConfigError
            });
        }
    }

    /**
     * Convert file to base64 string
     * @param {File} file - The image file to convert
     * @returns {Promise<string>} Base64 encoded string
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove the data:image/jpeg;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Analyze image using Google AI (Gemma) - Priority AI
     * @param {File} imageFile - The image file to analyze
     * @returns {Promise<Object>} Extracted profile data
     */
    async analyzeWithGemma(imageFile) {
        if (this.gemmaConfigError) {
            throw new Error(this.gemmaConfigError);
        }

        try {
            console.log('🤖 Attempting analysis with Gemma AI...');
            
            // Convert image to base64
            const base64Image = await this.fileToBase64(imageFile);
            const imageType = imageFile.type.includes('png') ? 'png' : 'jpeg';
            
            // Google AI Gemini Vision API endpoint
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleAiKey}`;
            
            const requestBody = {
                contents: [
                    {
                        parts: [
                            {
                                text: profileImageScanPrompt
                            },
                            {
                                inlineData: {
                                    mimeType: `image/${imageType}`,
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 2000,
                    temperature: 0.1
                }
            };

            console.log('📤 Gemma API Request:', {
                url: apiUrl.replace(googleAiKey, 'HIDDEN'),
                imageType: imageType,
                base64Length: base64Image.length
            });

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Gemma API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData: errorData
                });
                throw new Error(`Gemma API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            console.log('📥 Gemma API Response:', data);

            // Extract content from Gemma response
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
                console.error('❌ Unexpected Gemma response format:', data);
                throw new Error('No response received from Gemma AI service');
            }

            // Parse JSON response
            const extractedData = this.parseAiResponse(content);
            console.log('✅ Gemma analysis successful');
            return extractedData;

        } catch (error) {
            console.error('❌ Gemma AI analysis failed:', error);
            throw error;
        }
    }

    /**
     * Analyze image using Azure OpenAI - Fallback AI
     * @param {File} imageFile - The image file to analyze
     * @returns {Promise<Object>} Extracted profile data
     */
    async analyzeWithOpenAI(imageFile) {
        if (this.openaiConfigError) {
            throw new Error(this.openaiConfigError);
        }

        try {
            console.log('🤖 Attempting analysis with OpenAI (fallback)...');
            
            // Convert image to base64
            const base64Image = await this.fileToBase64(imageFile);
            const imageType = imageFile.type.includes('png') ? 'png' : 'jpeg';
            
            // Create messages for Azure OpenAI
            const messages = [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: profileImageScanPrompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/${imageType};base64,${base64Image}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ];

            // Construct Azure OpenAI API URL
            const baseUrl = azureTargetUrl.endsWith('/') ? azureTargetUrl : azureTargetUrl + '/';
            const apiUrl = `${baseUrl}openai/deployments/${azureOpenaiDeployment}/chat/completions?api-version=${azureOpenaiVersion}`;
            
            const requestBody = {
                messages: messages,
                max_completion_tokens: 2000,
                model: azureOpenaiDeployment
            };

            console.log('📤 OpenAI API Request:', {
                url: apiUrl,
                imageType: imageType,
                base64Length: base64Image.length
            });

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': azureOpenaiKey
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ OpenAI API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData: errorData
                });
                throw new Error(`OpenAI API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            console.log('📥 OpenAI API Response:', data);

            // Extract content from OpenAI response
            const content = data.choices?.[0]?.message?.content;
            if (!content) {
                console.error('❌ Unexpected OpenAI response format:', data);
                throw new Error('No response received from OpenAI service');
            }

            // Parse JSON response
            const extractedData = this.parseAiResponse(content);
            console.log('✅ OpenAI analysis successful (fallback)');
            return extractedData;

        } catch (error) {
            console.error('❌ OpenAI AI analysis failed:', error);
            throw error;
        }
    }

    /**
     * Parse AI response content to extract JSON
     * @param {string} content - Raw AI response content
     * @returns {Object} Parsed profile data
     */
    parseAiResponse(content) {
        try {
            // Try direct JSON parsing first
            return JSON.parse(content);
        } catch (parseError) {
            // If direct parsing fails, try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid JSON response from AI service');
        }
    }

    /**
     * Main analyze method with dual AI logic
     * Priority: Gemma -> OpenAI fallback
     * @param {File} imageFile - The image file to analyze
     * @returns {Promise<Object>} Extracted profile data
     */
    async analyzeImage(imageFile) {
        // Check if any AI service is available
        if (this.gemmaConfigError && this.openaiConfigError) {
            throw new Error('No AI services are configured. Please check your environment variables.');
        }

        let lastError = null;
        let usedService = null;

        // Try Gemma first (Priority AI)
        if (!this.gemmaConfigError) {
            try {
                const result = await this.analyzeWithGemma(imageFile);
                usedService = 'Gemma';
                
                // Add metadata about which service was used
                return {
                    ...result,
                    _aiService: 'gemma',
                    _serviceUsed: 'Gemma (Priority)',
                    _fallbackUsed: false
                };
            } catch (error) {
                console.warn('⚠️ Gemma AI failed, trying fallback...', error.message);
                lastError = error;
            }
        }

        // Fallback to OpenAI if Gemma fails or isn't configured
        if (!this.openaiConfigError) {
            try {
                const result = await this.analyzeWithOpenAI(imageFile);
                usedService = 'OpenAI';
                
                // Add metadata about which service was used
                return {
                    ...result,
                    _aiService: 'openai',
                    _serviceUsed: 'OpenAI (Fallback)',
                    _fallbackUsed: true
                };
            } catch (error) {
                console.error('❌ All AI services failed');
                lastError = error;
            }
        }

        // If both services fail
        throw new Error(`All AI services failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    /**
     * Check if at least one AI service is properly configured
     * @returns {boolean} True if at least one AI service is available
     */
    isConfigured() {
        return !this.gemmaConfigError || !this.openaiConfigError;
    }

    /**
     * Get status of both AI services
     * @returns {Object} Status object with service availability
     */
    getServiceStatus() {
        return {
            gemma: {
                available: !this.gemmaConfigError,
                error: this.gemmaConfigError
            },
            openai: {
                available: !this.openaiConfigError,
                error: this.openaiConfigError
            },
            hasAnyService: this.isConfigured()
        };
    }
}

// Export singleton instance
export default new DualAiService();