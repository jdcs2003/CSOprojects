import PricingCalculator from "@/components/PricingCalculator";

export default function Calculator() {
  return (
    <PricingCalculator
      companyFilter="L&M"
      title="L&M Internal Pricing Calculator"
      logoPath="/images/lm-logo.jpg"
      companyName="L&M Distribution & Logistics"
    />
  );
}
