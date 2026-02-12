import { useTheme } from "../hooks/useTheme";

export function DarkThemeDemo() {
  const { theme, isDark } = useTheme();

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-base-content mb-2">
          FlyonUI Dark Theme Demo
        </h1>
        <p className="text-base-content/70">
          Current theme: <span className="font-semibold">{theme}</span>
        </p>
      </div>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-base-content">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-accent">Accent</button>
          <button className="btn btn-success">Success</button>
          <button className="btn btn-warning">Warning</button>
          <button className="btn btn-error">Error</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-outline">Outline</button>
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-base-content">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card bg-base-100 border border-base-content/10 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-base-content">Card Title</h3>
              <p className="text-base-content/70">
                This card uses the uniform #06051d dark background.
              </p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">Action</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-content/10 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-base-content">Featured Card</h3>
              <p className="text-base-content/70">
                Deep dark #06051d background throughout the app.
              </p>
              <div className="card-actions justify-end">
                <button className="btn btn-secondary btn-sm">Learn More</button>
              </div>
            </div>
          </div>

          <div className="card bg-primary text-primary-content shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Primary Card</h3>
              <p>A card with primary color background.</p>
              <div className="card-actions justify-end">
                <button className="btn bg-base-100 text-base-content btn-sm">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-base-content">Alerts</h2>
        <div className="space-y-3">
          <div className="alert alert-info">
            <span className="icon-[tabler--info-circle] size-5"></span>
            <span>This is an info alert message</span>
          </div>
          <div className="alert alert-success">
            <span className="icon-[tabler--circle-check] size-5"></span>
            <span>Success! Your changes have been saved</span>
          </div>
          <div className="alert alert-warning">
            <span className="icon-[tabler--alert-triangle] size-5"></span>
            <span>Warning: Please review your settings</span>
          </div>
          <div className="alert alert-error">
            <span className="icon-[tabler--x-circle] size-5"></span>
            <span>Error: Something went wrong</span>
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-base-content">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="badge badge-primary">Primary</span>
          <span className="badge badge-secondary">Secondary</span>
          <span className="badge badge-accent">Accent</span>
          <span className="badge badge-success">Success</span>
          <span className="badge badge-warning">Warning</span>
          <span className="badge badge-error">Error</span>
          <span className="badge badge-ghost">Ghost</span>
          <span className="badge badge-outline">Outline</span>
        </div>
      </section>

      {/* Form Elements Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-base-content">
          Form Elements
        </h2>
        <div className="max-w-md space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Input Field</span>
            </label>
            <input
              type="text"
              placeholder="Type here..."
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Select Option</span>
            </label>
            <select className="select select-bordered w-full">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Textarea</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Enter your message..."
              rows={3}
            ></textarea>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Checkbox</span>
              <input type="checkbox" className="checkbox checkbox-primary" />
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Toggle</span>
              <input type="checkbox" className="toggle toggle-primary" />
            </label>
          </div>
        </div>
      </section>

      {/* Progress & Loading Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-base-content">
          Progress & Loading
        </h2>
        <div className="space-y-3">
          <progress
            className="progress progress-primary w-full"
            value="25"
            max="100"
          ></progress>
          <progress
            className="progress progress-secondary w-full"
            value="50"
            max="100"
          ></progress>
          <progress
            className="progress progress-accent w-full"
            value="75"
            max="100"
          ></progress>
        </div>
        <div className="flex gap-4 items-center">
          <span className="loading loading-spinner loading-sm"></span>
          <span className="loading loading-spinner loading-md"></span>
          <span className="loading loading-spinner loading-lg"></span>
          <span className="loading loading-dots loading-lg"></span>
          <span className="loading loading-ring loading-lg"></span>
        </div>
      </section>

      {/* Stats Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-base-content">Stats</h2>
        <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-100 border border-base-content/10">
          <div className="stat">
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary">25.6K</div>
            <div className="stat-desc">↗︎ 400 (22%)</div>
          </div>
          <div className="stat">
            <div className="stat-title">Active Projects</div>
            <div className="stat-value text-secondary">2,420</div>
            <div className="stat-desc">↗︎ 90 (14%)</div>
          </div>
          <div className="stat">
            <div className="stat-title">Revenue</div>
            <div className="stat-value text-accent">$89,400</div>
            <div className="stat-desc">↘︎ 12% compared to last month</div>
          </div>
        </div>
      </section>

      {/* Theme Status */}
      <section className="mt-12">
        <div className="alert bg-base-100 border border-base-content/10">
          <span className="icon-[tabler--palette] size-6"></span>
          <div>
            <h3 className="font-bold">
              Uniform Dark Theme {isDark ? "Enabled" : "Disabled"}
            </h3>
            <div className="text-xs text-base-content/70">
              All components use the same dark background (#06051d) for a
              consistent, uniform appearance.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
