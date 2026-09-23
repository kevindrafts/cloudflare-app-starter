import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  readPreferences,
  savePreferences,
  type Preferences,
} from "@/lib/preferences";
import { Sun, Moon } from "lucide-react";
export function Settings() {
  const [value, setValue] = useState<Preferences>(readPreferences);
  const [message, setMessage] = useState("");
  function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      savePreferences(value);
      setMessage("Preferences saved in this browser.");
    } catch {
      setMessage(
        "Your browser could not save preferences. Allow local storage and try again.",
      );
    }
  }
  return (
    <>
      <p className="eyebrow text-muted-foreground mb-3">
        Make yourself at home
      </p>
      <h1 className="page-heading">A workspace that feels like you.</h1>
      <p className="text-sm text-muted-foreground mt-3 mb-9">
        Simple preferences, saved in this browser.
      </p>
      <form
        onSubmit={save}
        className="max-w-3xl bg-card border rounded-xl overflow-hidden"
      >
        <section className="p-6 md:p-8 border-b">
          <h2 className="text-lg font-medium">Appearance</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Choose the light that works for you.
          </p>
          <fieldset>
            <legend className="sr-only">Color theme</legend>
            <div className="grid grid-cols-2 gap-4">
              {(["light", "dark"] as const).map((theme) => (
                <label
                  key={theme}
                  className={`border rounded-xl p-5 flex items-center gap-3 cursor-pointer ${value.theme === theme ? "ring-2 ring-primary" : ""}`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={value.theme === theme}
                    onChange={() => {
                      setValue({ ...value, theme });
                      setMessage("");
                    }}
                  />
                  {theme === "light" ? (
                    <Sun className="size-5" />
                  ) : (
                    <Moon className="size-5" />
                  )}
                  <span className="capitalize text-sm">{theme}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>
        <section className="p-6 md:p-8 border-b">
          <h2 className="text-lg font-medium">A little breathing room</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-5">
            Choose how much space your project cards use.
          </p>
          <label className="field max-w-xs">
            Card density
            <select
              className="control"
              value={value.density}
              onChange={(e) => {
                setValue({
                  ...value,
                  density: e.target.value as Preferences["density"],
                });
                setMessage("");
              }}
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label>
        </section>
        <div className="px-6 md:px-8 py-5 flex flex-wrap justify-between gap-4 items-center">
          <p role="status" className="text-xs text-muted-foreground">
            {message || "Preferences belong to this browser, not an account."}
          </p>
          <Button type="submit">Save preferences</Button>
        </div>
      </form>
      <div className="max-w-3xl mt-7 p-6 rounded-xl border">
        <h2 className="font-medium">About this workspace</h2>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          This is a public starter demo. There are no user accounts or private
          projects. Add server-side authentication and per-record authorization
          before storing real user data.
        </p>
        <a
          href="https://github.com/kevindrafts/cloudflare-app-starter#optional-integrations"
          className="inline-block text-sm underline mt-4"
        >
          Read the integration guide ↗
        </a>
      </div>
    </>
  );
}
