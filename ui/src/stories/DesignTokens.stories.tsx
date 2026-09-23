import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundation/Design Tokens",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const ColorSwatch = ({
  name,
  variable,
  description,
}: {
  name: string;
  variable: string;
  description?: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--space-md)",
      padding: "var(--space-sm)",
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "var(--radius-md)",
        backgroundColor: `var(${variable})`,
        border: "1px solid var(--color-border)",
        flexShrink: 0,
      }}
    />
    <div>
      <div
        style={{
          fontWeight: "var(--font-weight-medium)",
          color: "var(--color-text-primary)",
        }}
      >
        {name}
      </div>
      <code
        style={{
          fontSize: "var(--font-size-caption)",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-family-mono)",
        }}
      >
        {variable}
      </code>
      {description && (
        <div
          style={{
            fontSize: "var(--font-size-small)",
            color: "var(--color-text-tertiary)",
            marginTop: "2px",
          }}
        >
          {description}
        </div>
      )}
    </div>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section style={{ marginBottom: "var(--space-xl)" }}>
    <h2
      style={{
        fontSize: "var(--font-size-h2)",
        fontWeight: "var(--font-weight-semibold)",
        color: "var(--color-text-primary)",
        marginBottom: "var(--space-md)",
        paddingBottom: "var(--space-sm)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {title}
    </h2>
    {children}
  </section>
);

export const Colors: Story = {
  render: () => (
    <div
      style={{
        padding: "var(--space-lg)",
        backgroundColor: "var(--color-bg-primary)",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-h1)",
          fontWeight: "var(--font-weight-bold)",
          marginBottom: "var(--space-xl)",
          color: "var(--color-text-primary)",
        }}
      >
        Color Tokens
      </h1>

      <Section title="Background Colors">
        <div style={{ display: "grid", gap: "var(--space-xs)" }}>
          <ColorSwatch
            name="Primary"
            variable="--color-bg-primary"
            description="Main background"
          />
          <ColorSwatch
            name="Secondary"
            variable="--color-bg-secondary"
            description="Cards, panels"
          />
          <ColorSwatch
            name="Tertiary"
            variable="--color-bg-tertiary"
            description="Nested elements"
          />
          <ColorSwatch
            name="Hover"
            variable="--color-bg-hover"
            description="Hover state"
          />
        </div>
      </Section>

      <Section title="Accent Colors">
        <div style={{ display: "grid", gap: "var(--space-xs)" }}>
          <ColorSwatch
            name="Accent"
            variable="--color-accent"
            description="Primary action"
          />
          <ColorSwatch
            name="Accent Hover"
            variable="--color-accent-hover"
            description="Hover state"
          />
          <ColorSwatch
            name="Accent Active"
            variable="--color-accent-active"
            description="Active state"
          />
        </div>
      </Section>

      <Section title="Semantic Colors">
        <div style={{ display: "grid", gap: "var(--space-xs)" }}>
          <ColorSwatch
            name="Success"
            variable="--color-success"
            description="Success, connected"
          />
          <ColorSwatch
            name="Warning"
            variable="--color-warning"
            description="Warning, unstable"
          />
          <ColorSwatch
            name="Danger"
            variable="--color-danger"
            description="Error, danger"
          />
        </div>
      </Section>

      <Section title="Text Colors">
        <div style={{ display: "grid", gap: "var(--space-xs)" }}>
          <ColorSwatch
            name="Primary"
            variable="--color-text-primary"
            description="Main text"
          />
          <ColorSwatch
            name="Secondary"
            variable="--color-text-secondary"
            description="Subdued text"
          />
          <ColorSwatch
            name="Tertiary"
            variable="--color-text-tertiary"
            description="Hints, placeholders"
          />
          <ColorSwatch
            name="Disabled"
            variable="--color-text-disabled"
            description="Disabled state"
          />
        </div>
      </Section>

      <Section title="Border Colors">
        <div style={{ display: "grid", gap: "var(--space-xs)" }}>
          <ColorSwatch
            name="Default"
            variable="--color-border"
            description="Standard border"
          />
          <ColorSwatch
            name="Subtle"
            variable="--color-border-subtle"
            description="Light separator"
          />
          <ColorSwatch
            name="Focus"
            variable="--color-border-focus"
            description="Focus ring"
          />
        </div>
      </Section>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div
      style={{
        padding: "var(--space-lg)",
        backgroundColor: "var(--color-bg-primary)",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-h1)",
          fontWeight: "var(--font-weight-bold)",
          marginBottom: "var(--space-xl)",
          color: "var(--color-text-primary)",
        }}
      >
        Typography Tokens
      </h1>

      <Section title="Font Sizes">
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          <div>
            <span
              style={{
                fontSize: "var(--font-size-h1)",
                color: "var(--color-text-primary)",
              }}
            >
              Heading 1 (24px)
            </span>
            <code
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-family-mono)",
              }}
            >
              --font-size-h1
            </code>
          </div>
          <div>
            <span
              style={{
                fontSize: "var(--font-size-h2)",
                color: "var(--color-text-primary)",
              }}
            >
              Heading 2 (18px)
            </span>
            <code
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-family-mono)",
              }}
            >
              --font-size-h2
            </code>
          </div>
          <div>
            <span
              style={{
                fontSize: "var(--font-size-h3)",
                color: "var(--color-text-primary)",
              }}
            >
              Heading 3 (16px)
            </span>
            <code
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-family-mono)",
              }}
            >
              --font-size-h3
            </code>
          </div>
          <div>
            <span
              style={{
                fontSize: "var(--font-size-body)",
                color: "var(--color-text-primary)",
              }}
            >
              Body (14px)
            </span>
            <code
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-family-mono)",
              }}
            >
              --font-size-body
            </code>
          </div>
          <div>
            <span
              style={{
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-primary)",
              }}
            >
              Caption (12px)
            </span>
            <code
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-family-mono)",
              }}
            >
              --font-size-caption
            </code>
          </div>
          <div>
            <span
              style={{
                fontSize: "var(--font-size-small)",
                color: "var(--color-text-primary)",
              }}
            >
              Small (11px)
            </span>
            <code
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-family-mono)",
              }}
            >
              --font-size-small
            </code>
          </div>
        </div>
      </Section>

      <Section title="Font Weights">
        <div style={{ display: "grid", gap: "var(--space-sm)" }}>
          <div
            style={{
              fontWeight: "var(--font-weight-normal)",
              color: "var(--color-text-primary)",
            }}
          >
            Normal (400) - --font-weight-normal
          </div>
          <div
            style={{
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-text-primary)",
            }}
          >
            Medium (500) - --font-weight-medium
          </div>
          <div
            style={{
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-primary)",
            }}
          >
            Semibold (600) - --font-weight-semibold
          </div>
          <div
            style={{
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-text-primary)",
            }}
          >
            Bold (700) - --font-weight-bold
          </div>
        </div>
      </Section>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div
      style={{
        padding: "var(--space-lg)",
        backgroundColor: "var(--color-bg-primary)",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-h1)",
          fontWeight: "var(--font-weight-bold)",
          marginBottom: "var(--space-xl)",
          color: "var(--color-text-primary)",
        }}
      >
        Spacing Tokens
      </h1>

      <Section title="Spacing Scale">
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          {[
            { name: "xs", value: "4px" },
            { name: "sm", value: "8px" },
            { name: "md", value: "16px" },
            { name: "lg", value: "24px" },
            { name: "xl", value: "32px" },
            { name: "2xl", value: "48px" },
          ].map(({ name, value }) => (
            <div
              key={name}
              style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}
            >
              <div
                style={{
                  width: `var(--space-${name})`,
                  height: 24,
                  backgroundColor: "var(--color-accent)",
                  borderRadius: "var(--radius-sm)",
                }}
              />
              <div>
                <span
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {name} ({value})
                </span>
                <code
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-caption)",
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-family-mono)",
                  }}
                >
                  --space-{name}
                </code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Border Radius">
        <div
          style={{ display: "flex", gap: "var(--space-lg)", flexWrap: "wrap" }}
        >
          {[
            { name: "sm", value: "4px" },
            { name: "md", value: "8px" },
            { name: "lg", value: "12px" },
            { name: "xl", value: "16px" },
            { name: "full", value: "9999px" },
          ].map(({ name, value }) => (
            <div key={name} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "2px solid var(--color-accent)",
                  borderRadius: `var(--radius-${name})`,
                  marginBottom: "var(--space-xs)",
                }}
              />
              <div
                style={{
                  fontSize: "var(--font-size-caption)",
                  color: "var(--color-text-primary)",
                }}
              >
                {name}
              </div>
              <code
                style={{
                  fontSize: "var(--font-size-small)",
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-family-mono)",
                }}
              >
                {value}
              </code>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};
