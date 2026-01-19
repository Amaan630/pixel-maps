import Constants from 'expo-constants';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

const ENTITLEMENT_ID = 'Pixel Maps Pro';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  presentPaywall: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Initialize RevenueCat
  useEffect(() => {
    const initializePurchases = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

        const apiKey = Constants.expoConfig?.extra?.revenueCatApiKey;

        if (!apiKey) {
          console.error('RevenueCat API key not found in config');
          setIsLoading(false);
          return;
        }

        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          await Purchases.configure({ apiKey });
        }

        // Wait for both customer info AND offerings to load
        await Promise.all([
          refreshSubscriptionStatus(),
          Purchases.getOfferings(),
        ]);
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePurchases();
  }, []);

  // Refresh subscription status when app comes to foreground (but not during purchase)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !isPurchasing) {
        refreshSubscriptionStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isPurchasing]);

  // Listen for customer info updates
  useEffect(() => {
    const customerInfoUpdated = (info: CustomerInfo) => {
      setCustomerInfo(info);
      checkEntitlement(info);
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdated);
    };
  }, []);

  const checkEntitlement = (info: CustomerInfo) => {
    const hasEntitlement = typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    setIsSubscribed(hasEntitlement);
  };

  const refreshSubscriptionStatus = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      console.log('Customer info:', info);
      setCustomerInfo(info);
      checkEntitlement(info);
    } catch (error) {
      console.error('Failed to get customer info:', error);
    }
  }, []);

  const presentPaywall = useCallback(async (): Promise<boolean> => {
    try {
      setIsPurchasing(true);
      const paywallResult = await RevenueCatUI.presentPaywall();

      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await refreshSubscriptionStatus();
          return true;
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to present paywall:', error);
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [refreshSubscriptionStatus]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      setIsPurchasing(true);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      checkEntitlement(info);
      return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        isLoading,
        customerInfo,
        presentPaywall,
        restorePurchases,
        refreshSubscriptionStatus,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
