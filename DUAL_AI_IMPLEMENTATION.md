# Dual AI Implementation Guide

## Overview
The FSUU Registrar system now supports **dual AI functionality** with **Gemma as priority** and **OpenAI as fallback** for profile image analysis and data extraction.

## Implementation Details

### 🤖 AI Service Priority
1. **Primary**: Google AI (Gemma) - Fast, efficient, cost-effective
2. **Fallback**: Azure OpenAI - Reliable backup when Gemma fails

### 📁 Files Modified/Created

#### New Files:
- `resources/js/components/providers/dualAiService.jsx` - Main dual AI service
- `dual-ai-env-example.txt` - Environment variable example

#### Modified Files:
- `resources/js/components/providers/appConfig.jsx` - Added Google AI key export
- `resources/js/components/views/Private/PageProfile/components/ModalFormProfile.jsx` - Updated to use dual AI

### 🔧 Configuration Required

Add to your `.env` file:
```env
# Google AI (Gemma) - Priority AI
VITE_GOOGLEAI_API_KEY=your_google_ai_api_key_here

# Azure OpenAI - Fallback (existing configuration)
VITE_AZURE_OPENAI_KEY=your_azure_key
VITE_AZURE_TARGET_URL=your_azure_endpoint
VITE_AZURE_OPENAI_VERSION=2024-02-15-preview
VITE_AZURE_OPENAI_DEPLOYMENT=your_deployment
```

### 🚀 How It Works

1. **User uploads image** for AI profile extraction
2. **System attempts Gemma first** (priority AI)
3. **If Gemma fails**, system automatically falls back to OpenAI
4. **User receives notification** indicating which AI service was used
5. **Extracted data populates** the profile form

### 📊 Service Status Tracking

The system provides detailed status information:
- Which AI service was used (Gemma/OpenAI)
- Whether fallback was triggered
- Configuration status of both services
- Error handling for both services

### 🔄 Automatic Fallback Logic

```javascript
// Priority: Gemma → OpenAI fallback
async analyzeImage(imageFile) {
    // Try Gemma first
    if (gemmaConfigured) {
        try {
            return await analyzeWithGemma(imageFile);
        } catch (error) {
            console.warn('Gemma failed, trying OpenAI...');
        }
    }
    
    // Fallback to OpenAI
    if (openaiConfigured) {
        return await analyzeWithOpenAI(imageFile);
    }
    
    throw new Error('No AI services available');
}
```

### ✅ Benefits

1. **Reliability**: Dual redundancy ensures service availability
2. **Cost Optimization**: Gemma is typically more cost-effective
3. **Performance**: Gemma often provides faster responses
4. **Flexibility**: Easy to configure either or both services
5. **Transparency**: Users know which AI service processed their request

### 🔍 Usage Example

```javascript
import dualAiService from './providers/dualAiService';

// Analyze image with automatic fallback
const result = await dualAiService.analyzeImage(imageFile);

// Result includes metadata
console.log(result._serviceUsed); // "Gemma (Priority)" or "OpenAI (Fallback)"
console.log(result._fallbackUsed); // true/false
```

### 🛠️ Service Status Check

```javascript
const status = dualAiService.getServiceStatus();
console.log(status);
// {
//   gemma: { available: true, error: null },
//   openai: { available: true, error: null },
//   hasAnyService: true
// }
```

### 📋 Getting Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy and add to your `.env` file as `VITE_GOOGLEAI_API_KEY`

### 🔧 Troubleshooting

**Common Issues:**
- **Missing API Keys**: Check `.env` file configuration
- **Network Issues**: Verify internet connectivity and API endpoints
- **Rate Limits**: Both services have usage limits
- **Image Format**: Ensure JPG/PNG format and reasonable file size

**Error Handling:**
- System provides detailed error messages
- Automatic fallback reduces service interruption
- User notifications indicate which service failed

### 🎯 Future Enhancements

- Add more AI providers (Claude, etc.)
- Implement load balancing across services
- Add usage analytics and cost tracking
- Configurable retry attempts
- Service health monitoring

This implementation ensures robust, reliable AI-powered profile data extraction with built-in redundancy and transparency.