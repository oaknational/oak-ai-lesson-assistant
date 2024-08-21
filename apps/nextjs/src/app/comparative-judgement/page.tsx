import dynamic from "next/dynamic";

const DynamicHeader = dynamic(() => import("."), {
  loading: () => <p>Loading...</p>,
});

export default function CJ() {
  return <DynamicHeader />;
}
