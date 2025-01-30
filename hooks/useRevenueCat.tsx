import { useEffect, useState } from "react";
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";
import Offering from "react-native-purchases";

// Entitlements identifier in RevenueCat
const entitlementsIdentifier = {
  identifier: "gamma_noise_subscriptions",
};

// In-App Purchase identifiers for refference
const iapIdentifiers = { lifetime: "-" };

// Subscription identifiers for refference
const subIdentifiers = {
  monthly: "gamma_noise_monthly",
  yearly: "gamma_noise_yearly",
};

// TypeScript types for the data structures
interface CustomOffering extends Offering {
  [key: string]: PurchasesPackage | undefined;
}

export default function useRevenueCat() {
  const [currentOffering, setCurrentOffering] = useState<CustomOffering | null>(
    null
  );
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const isProMember =
    customerInfo?.entitlements?.active?.[entitlementsIdentifier.identifier];

  useEffect(() => {
    const fetchData = async () => {
      try {
        Purchases.configure({
          apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? "",
        });

        // Get all offerings setup from RevenueCat
        const offerings = await Purchases.getOfferings();
        const customerInfo = await Purchases.getCustomerInfo();

        setCurrentOffering(offerings.current as any);
        setCustomerInfo(customerInfo);
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const customerInfoUpdated = async (purchaserInfo: CustomerInfo) => {
      setCustomerInfo(purchaserInfo);
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);
  }, []);

  return { currentOffering, customerInfo, isProMember };
}
