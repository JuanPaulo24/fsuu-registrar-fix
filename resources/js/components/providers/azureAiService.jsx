import {
    azureTargetUrl,
    azureOpenaiVersion,
    azureOpenaiModel,
    azureOpenaiDeployment,
    azureOpenaiKey
} from "./appConfig";
import profileImageScanPrompt from "./Aiprompt";

/**
 * Azure AI Service for image analysis and profile data extraction
 */
class AzureAiService {
    constructor() {
        // Initialize configuration
        this.configurationError = null;

        // Validate required configuration
        if (!azureTargetUrl || !azureOpenaiKey || !azureOpenaiVersion || !azureOpenaiDeployment) {
            this.configurationError = 'Azure AI configuration is incomplete. Please check your .env file and restart the development server.';
            console.error(this.configurationError);
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
     * Analyze image and extract profile information
     * @param {File} imageFile - The image file to analyze
     * @returns {Promise<Object>} Extracted profile data
     */
    async analyzeImage(imageFile) {
        // Check if configuration is available
        if (this.configurationError) {
            throw new Error(this.configurationError);
        }

        try {
            // Convert image to base64
            const base64Image = await this.fileToBase64(imageFile);
            
            // Determine the image format
            const imageType = imageFile.type.includes('png') ? 'png' : 'jpeg';
            
            // Create the messages for Azure OpenAI Chat Completions API
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

            console.log("Message structure:", {
                imageType: imageType,
                base64Length: base64Image.length,
                promptLength: profileImageScanPrompt.length,
                messageContentCount: messages[0].content.length
            });

            // Construct the correct API URL for Azure OpenAI Chat Completions
            const baseUrl = azureTargetUrl.endsWith('/') ? azureTargetUrl : azureTargetUrl + '/';
            const apiUrl = `${baseUrl}openai/deployments/${azureOpenaiDeployment}/chat/completions?api-version=${azureOpenaiVersion}`;
            
            const requestBody = {
                messages: messages,
                max_completion_tokens: 2000,
                model: azureOpenaiDeployment
            };

            console.log("Azure AI Request:", {
                url: apiUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': azureOpenaiKey ? 'SET' : 'MISSING'
                },
                bodyPreview: {
                    messagesCount: messages.length,
                    firstMessageRole: messages[0]?.role,
                    firstMessageContentType: Array.isArray(messages[0]?.content) ? 'array' : typeof messages[0]?.content
                }
            });

            // Call Azure OpenAI using the correct endpoint
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
                console.error("Azure API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    errorData: errorData
                });
                throw new Error(`Azure API Error ${response.status}: ${errorData.error?.message || errorData.message || response.statusText}`);
            }

            const data = await response.json();

            // Extract and parse the response from Azure OpenAI Chat Completions API
            const content = data.choices?.[0]?.message?.content;
            if (!content) {
                console.error("Unexpected response format:", data);
                throw new Error("No response received from AI service");
            }

            // Try to parse JSON response
            try {
                const extractedData = JSON.parse(content);
                return extractedData;
            } catch (parseError) {
                // If JSON parsing fails, try to extract JSON from the response
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                throw new Error("Invalid JSON response from AI service");
            }

        } catch (error) {
            console.error("Azure AI Service Error:", error);
            throw new Error(`AI analysis failed: ${error.message}`);
        }
    }

    /**
     * Check if Azure AI service is properly configured
     * @returns {boolean} True if all required configuration is present
     */
    isConfigured() {
        return !this.configurationError;
    }
}

// Export singleton instance
export default new AzureAiService();