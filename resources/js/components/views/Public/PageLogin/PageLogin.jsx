import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faKey,
} from "@fortawesome/pro-solid-svg-icons";
import {
    Alert,
    Button,
    Form,
    Input,
    Layout,
    Modal,
    Typography,
} from "antd";
import { POST } from "../../../providers/useAxiosQuery";
import {
    appDescription,
    appName,
    encrypt,
    appLoginLogo,
    cloudflareSiteKey
} from "../../../providers/appConfig";
import validateRules from "../../../providers/validateRules";
import FloatInput from "../../../providers/FloatInput";
import FloatInputPassword from "../../../providers/FloatInputPassword";

export default function PageLogin() {
    const [errorMessage, setErrorMessage] = useState(null);
    const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);
    const [glowIntensity, setGlowIntensity] = useState(0.6);
    const [glowScale, setGlowScale] = useState(1);
    const [outerGlowIntensity, setOuterGlowIntensity] = useState(0.3);
    const [outerGlowScale, setOuterGlowScale] = useState(0.95);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [turnstileLoaded, setTurnstileLoaded] = useState(false);
    const turnstileRef = useRef(null);
    const [form] = Form.useForm();
    const errorTimeoutRef = useRef(null);
    const { mutate: mutateLogin, isLoading: isLoadingLogin } = POST("api/login", null, false); // Disable global loading for login
    const { mutate: mutateForgotPassword, isLoading: isLoadingForgotPassword } = POST("api/forgot-password", null, false); // Disable global loading for forgot password

    // Load Cloudflare Turnstile script
    useEffect(() => {
        const loadTurnstileScript = () => {
            if (window.turnstile) {
                setTurnstileLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            script.onload = () => setTurnstileLoaded(true);
            script.onerror = () => {
                console.error('Failed to load Turnstile script');
                setTurnstileLoaded(false);
            };
            document.head.appendChild(script);
        };

        loadTurnstileScript();
    }, []);

    // Check for session expiry on component mount
    useEffect(() => {
        const sessionExpired = localStorage.getItem('sessionExpired');
        if (sessionExpired === 'true') {
            setSessionExpiredMessage('Your session has expired due to inactivity. Please log in again.');
            // Clear the flag so it doesn't show again
            localStorage.removeItem('sessionExpired');
        }
    }, []);

    // Shimmering light animation effect
    useEffect(() => {
        const animateShimmer = () => {
            const time = Date.now() * 0.001; // Convert to seconds
            
            // Create complex shimmering with multiple frequencies
            const fastShimmer = Math.sin(time * Math.PI * 2) * 0.5 + 0.5; // Fast 1 second cycle
            const mediumShimmer = Math.sin(time * Math.PI * 0.8) * 0.5 + 0.5; // Medium 2.5 second cycle
            const slowShimmer = Math.sin(time * Math.PI * 0.3) * 0.5 + 0.5; // Slow 6.7 second cycle
            
            // Combine shimmers for complex light behavior
            const combinedShimmer = (fastShimmer * 0.4 + mediumShimmer * 0.4 + slowShimmer * 0.2);
            
            // Inner light shimmering (much brighter, more intense)
            setGlowIntensity(0.7 + combinedShimmer * 0.8); // 0.7 to 1.5 (over 100% for extra brightness)
            setGlowScale(0.98 + combinedShimmer * 0.04); // Very subtle scale change
            
            // Outer glow shimmering (different phase, brighter)
            const outerPhase = time * Math.PI * 0.5 + Math.PI / 3; // Different phase
            const outerShimmer = Math.sin(outerPhase) * 0.5 + 0.5;
            const outerSlow = Math.sin(time * Math.PI * 0.2) * 0.5 + 0.5;
            const combinedOuter = (outerShimmer * 0.6 + outerSlow * 0.4);
            
            setOuterGlowIntensity(0.5 + combinedOuter * 0.8); // 0.5 to 1.3 (much brighter)
            setOuterGlowScale(0.97 + combinedOuter * 0.06); // Subtle scale
        };

        const intervalId = setInterval(animateShimmer, 33); // 30 FPS for smoother shimmer
        
        return () => clearInterval(intervalId);
    }, []);

    // Handle form validation failure and auto-dismiss errors
    const onFinishFailed = () => {
        // Clear session expired message when there are validation errors
        setSessionExpiredMessage(null);
        
        // Clear any existing timeout
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }
        
        // Set new timeout to clear errors after 3 seconds
        errorTimeoutRef.current = setTimeout(() => {
            form.setFields([
                { name: 'email', errors: [] },
                { name: 'password', errors: [] }
            ]);
        }, 3000);
    };

    // Render Turnstile widget when script is loaded
    useEffect(() => {
        if (turnstileLoaded && window.turnstile && cloudflareSiteKey && turnstileRef.current) {
            try {
                window.turnstile.render(turnstileRef.current, {
                    sitekey: cloudflareSiteKey,
                    callback: (token) => {
                        setTurnstileToken(token);
                        setErrorMessage(null);
                    },
                    'error-callback': () => {
                        setTurnstileToken(null);
                        setErrorMessage('Captcha verification failed. Please try again.');
                    },
                    'expired-callback': () => {
                        setTurnstileToken(null);
                        setErrorMessage('Captcha expired. Please verify again.');
                    },
                    theme: 'light',
                    size: 'normal'
                });
            } catch (error) {
                console.error('Failed to render Turnstile widget:', error);
            }
        }
    }, [turnstileLoaded, cloudflareSiteKey]);

    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
        };
    }, []);

    // Reset Turnstile widget
    const resetTurnstile = () => {
        if (window.turnstile && turnstileRef.current) {
            window.turnstile.reset(turnstileRef.current);
            setTurnstileToken(null);
        }
    };

    const handleForgotPassword = () => {
        if (!forgotPasswordEmail) {
            setForgotPasswordMessage("Please enter your email address.");
            return;
        }

        mutateForgotPassword(
            { email: forgotPasswordEmail },
            {
                onSuccess: (res) => {
                    setForgotPasswordMessage(res.message || "Password reset link sent to your email.");
                    setTimeout(() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail("");
                        setForgotPasswordMessage("");
                    }, 3000);
                },
                onError: (err) => {
                    setForgotPasswordMessage(
                        err.response?.data?.message || "An error occurred. Please try again."
                    );
                }
            }
        );
    };

    const onFinish = (values) => {
        // Clear session expired message when attempting to login
        setSessionExpiredMessage(null);
        
        // Check if Turnstile token is available (only if Cloudflare is configured)
        if (cloudflareSiteKey && !turnstileToken) {
            setErrorMessage('Please complete the captcha verification.');
            return;
        }
        
        // Include Turnstile token in the request if available
        const loginData = {
            ...values,
            ...(turnstileToken && { 'cf-turnstile-response': turnstileToken })
        };
        
        mutateLogin(loginData, {
            onSuccess: (res) => {
                if (res.data) {
                    localStorage.userdata = encrypt(JSON.stringify(res.data));
                    localStorage.token = res.token;
                    window.location.reload();
                } else {
                    setErrorMessage(res.message);
                    // Reset Turnstile on error
                    resetTurnstile();
                }
            },
            onError: (error) => {
                // Error logged for debugging - removed for security
                setErrorMessage(error.response.data.message);
                // Reset Turnstile on error
                resetTurnstile();
            },
        });
    };

    const handleEnterKeyPress = () => {
        form.validateFields().then((values) => {
            onFinish(values);
        }).catch((errorInfo) => {
            onFinishFailed();
        });
    };

    return (
        <Layout.Content className="login-page-container" id="PageLogin">
            <div className="login-wrapper">
                {/* Desktop: Left Section - Blue background with FSUU logo and title */}
                <div className="desktop-left-section">
                    <div className="background-pattern"></div>
                    <div className="background-overlay"></div>
                    
                    <div className="left-content">
                        <div className="logo-section">
                            {/* React-controlled shimmering effects */}
                            {/* Main shimmer light */}
                            <div 
                                className="shimmer-inner"
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '130px',
                                    height: '130px',
                                    background: `radial-gradient(circle, 
                                        rgba(255, 255, 255, ${Math.min(glowIntensity * 0.8, 1)}) 0%, 
                                        rgba(255, 255, 255, ${Math.min(glowIntensity * 0.6, 1)}) 25%, 
                                        rgba(255, 255, 255, ${Math.min(glowIntensity * 0.4, 1)}) 50%, 
                                        rgba(255, 255, 255, ${Math.min(glowIntensity * 0.2, 1)}) 75%,
                                        transparent 90%)`,
                                    borderRadius: '50%',
                                    transform: `translate(-50%, -50%) scale(${glowScale})`,
                                    zIndex: 1,
                                    filter: `blur(6px) brightness(${2 + glowIntensity * 1.5})`,
                                    opacity: Math.min(glowIntensity, 1),
                                    boxShadow: `0 0 ${30 + glowIntensity * 50}px rgba(255, 255, 255, ${Math.min(glowIntensity * 0.7, 1)})`
                                }}
                            />
                            {/* Sparkle layer */}
                            <div 
                                className="shimmer-sparkle"
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '160px',
                                    height: '160px',
                                    background: `conic-gradient(
                                        transparent 0deg,
                                        rgba(255, 255, 255, ${Math.min(glowIntensity * 0.5, 1)}) 45deg,
                                        transparent 90deg,
                                        rgba(255, 255, 255, ${Math.min(glowIntensity * 0.4, 1)}) 135deg,
                                        transparent 180deg,
                                        rgba(255, 255, 255, ${Math.min(glowIntensity * 0.6, 1)}) 225deg,
                                        transparent 270deg,
                                        rgba(255, 255, 255, ${Math.min(glowIntensity * 0.3, 1)}) 315deg,
                                        transparent 360deg)`,
                                    borderRadius: '50%',
                                    transform: `translate(-50%, -50%) scale(${glowScale}) rotate(${Date.now() * 0.05}deg)`,
                                    zIndex: 2,
                                    filter: `blur(4px) brightness(${1.8 + glowIntensity * 0.7})`,
                                    opacity: Math.min(glowIntensity * 0.9, 1)
                                }}
                            />
                            {/* Outer soft glow */}
                            <div 
                                className="shimmer-outer"
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '200px',
                                    height: '200px',
                                    background: `radial-gradient(circle, 
                                        transparent 40%, 
                                        rgba(255, 255, 255, ${Math.min(outerGlowIntensity * 0.4, 1)}) 50%, 
                                        rgba(255, 255, 255, ${Math.min(outerGlowIntensity * 0.25, 1)}) 70%, 
                                        rgba(255, 255, 255, ${Math.min(outerGlowIntensity * 0.15, 1)}) 85%,
                                        transparent 95%)`,
                                    borderRadius: '50%',
                                    transform: `translate(-50%, -50%) scale(${outerGlowScale})`,
                                    zIndex: 0,
                                    filter: `blur(8px) brightness(${1.8 + outerGlowIntensity * 1})`,
                                    opacity: Math.min(outerGlowIntensity, 1)
                                }}
                            />
                            <img
                                src={appLoginLogo}
                                alt="FSUU Logo"
                                className="main-logo"
                                style={{
                                    position: 'relative',
                                    zIndex: 2
                                }}
                            />
                        </div>
                        
                        <div className="text-section">
                            <Typography.Title level={1} className="main-title">
                                {appName}
                            </Typography.Title>
                            <Typography.Text className="main-subtitle">
                                {appDescription}
                            </Typography.Text>
                        </div>
                    </div>
                </div>

                {/* Right Section - Login form area */}
                <div className="login-section">
                    {/* Mobile: Logo at top */}
                    <div className="mobile-logo-section">
                        <img
                            src={appLoginLogo}
                            alt="FSUU Logo"
                            className="mobile-logo"
                        />
                    </div>
                    
                    <div className="form-wrapper">
                        <div className="login-card">
                            <div className="card-header">
                                <Typography.Title level={3} className="portal-title">
                                    REGISTRAR PORTAL
                                </Typography.Title>
                                <div className="title-divider"></div>
                            </div>

                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                className="login-form"
                                size="large"
                            >
                                <Form.Item
                                    name="email"
                                    rules={[validateRules.required()]}
                                    className="form-input-item"
                                >
                                    <FloatInput
                                        label="Username/Email"
                                        placeholder="Enter your username or email"
                                        required
                                        onPressEnter={handleEnterKeyPress}
                                        onChange={() => {
                                            setSessionExpiredMessage(null);
                                            setErrorMessage(null);
                                        }}
                                                prefix={
                                                    <FontAwesomeIcon
                                                        icon={faEnvelope}
                                                        className="input-icon"
                                                    />
                                                }
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    rules={[validateRules.required()]}
                                    className="form-input-item"
                                >
                                    <FloatInputPassword
                                        label="Password"
                                        placeholder="Enter your password"
                                        required
                                        onPressEnter={handleEnterKeyPress}
                                        onChange={() => {
                                            setSessionExpiredMessage(null);
                                            setErrorMessage(null);
                                        }}
                                                prefix={
                                                    <FontAwesomeIcon
                                                        icon={faKey}
                                                        className="input-icon"
                                                    />
                                                }
                                        autoComplete="new-password"
                                    />
                                </Form.Item>

                                {/* Cloudflare Turnstile Captcha */}
                                {cloudflareSiteKey && (
                                    <Form.Item className="captcha-item" style={{ marginBottom: '24px', textAlign: 'center' }}>
                                        <div 
                                            ref={turnstileRef}
                                            style={{ 
                                                display: 'inline-block',
                                                minHeight: '65px',
                                                width: '100%',
                                                maxWidth: '300px'
                                            }}
                                        />
                                        {!turnstileLoaded && (
                                            <div style={{ 
                                                padding: '20px', 
                                                textAlign: 'center', 
                                                color: '#666',
                                                fontSize: '14px'
                                            }}>
                                                Loading security verification...
                                            </div>
                                        )}
                                    </Form.Item>
                                )}

                                <Form.Item className="form-submit-item">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isLoadingLogin}
                                        className="login-button"
                                        block
                                        size="large"
                                        disabled={cloudflareSiteKey && !turnstileToken}
                                    >
                                        {isLoadingLogin ? 'Signing In...' : 'LOGIN'}
                                    </Button>
                                </Form.Item>

                                <div className="forgot-password-section">
                                    <Typography.Link 
                                        className="forgot-password-link"
                                        onClick={() => setShowForgotPassword(true)}
                                    >
                                        Forgot Password?
                                    </Typography.Link>
                                </div>
                            </Form>

                            {/* Session Expired Message */}
                            {sessionExpiredMessage && !errorMessage && (
                                <Alert
                                    type="warning"
                                    message={sessionExpiredMessage}
                                    className="session-expired-alert"
                                    showIcon
                                    style={{ marginTop: '16px' }}
                                />
                            )}

                            {/* Login Error Message */}
                            {errorMessage && (
                                <Alert
                                    type="error"
                                    message={
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: errorMessage,
                                            }}
                                        />
                                    }
                                    className="error-alert"
                                    showIcon
                                    style={{ marginTop: '16px' }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="page-footer">
                <div className="footer-content">
                    <Typography.Text className="footer-brand">
                        Office of Registrar
                    </Typography.Text>
                    <div className="footer-contact">
                        <Typography.Text className="contact-info">
                            (085) 342-5661 / (085) 342-5662 | registrar@fsuu.edu.ph
                        </Typography.Text>
                    </div>
                    <Typography.Text className="footer-version">
                        v0.0.14
                    </Typography.Text>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <Modal
                title="Reset Password"
                open={showForgotPassword}
                onCancel={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                    setForgotPasswordMessage("");
                }}
                footer={[
                    <Button 
                        key="cancel" 
                        onClick={() => {
                            setShowForgotPassword(false);
                            setForgotPasswordEmail("");
                            setForgotPasswordMessage("");
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={isLoadingForgotPassword}
                        onClick={handleForgotPassword}
                    >
                        Send Reset Link
                    </Button>
                ]}
                centered
                width={400}
            >
                <div style={{ marginBottom: '16px' }}>
                    <Typography.Text>
                        Enter your email address and we'll send you a link to reset your password.
                    </Typography.Text>
                </div>
                
                <Input
                    placeholder="Enter your email address"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    onPressEnter={handleForgotPassword}
                    size="large"
                    style={{ marginBottom: '16px' }}
                />
                
                {forgotPasswordMessage && (
                    <Alert
                        message={forgotPasswordMessage}
                        type={forgotPasswordMessage.includes("error") || forgotPasswordMessage.includes("Please enter") ? "error" : "success"}
                        showIcon
                        style={{ marginTop: '8px' }}
                    />
                )}
            </Modal>
        </Layout.Content>
    );
}