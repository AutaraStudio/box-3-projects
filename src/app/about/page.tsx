import TransitionLink from "@/components/transition/TransitionLink";

export default function About() {
  return (
    <main
      data-theme="dark"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "3rem",
        backgroundColor: "var(--theme-bg)",
        color: "var(--theme-text)",
      }}
    >
      <h1 className="text-display">About</h1>
      <p className="text-large">Dark theme. Click below to wipe back home.</p>
      <TransitionLink
        href="/"
        pageName="Home"
        className="text-large"
        style={{
          color: "var(--theme-text)",
          textDecoration: "underline",
          textUnderlineOffset: "0.25em",
        }}
      >
        ← Back to Home
      </TransitionLink>
    </main>
  );
}
