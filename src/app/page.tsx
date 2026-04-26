import TransitionLink from "@/components/transition/TransitionLink";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "3rem",
      }}
    >
      <h1 className="text-display">Home</h1>
      <p className="text-large">Click below to test the page transition.</p>
      <TransitionLink
        href="/about"
        pageName="About"
        className="text-large"
        style={{
          color: "var(--theme-text)",
          textDecoration: "underline",
          textUnderlineOffset: "0.25em",
        }}
      >
        Go to About →
      </TransitionLink>
    </main>
  );
}
