import ContentLoader from "react-content-loader";

type Props = {
  index: number;
};

function ProjectRowSkeleton({ index }: Props) {
  const isEven = index % 2 === 0;
  const baseOpacity = isEven ? 1 : 0.75;

  return (
    <tr style={{ opacity: baseOpacity }}>
      {/* Name */}
      <td>
        <ContentLoader
          speed={1.4}
          width={140}
          height={20}
          viewBox="0 0 140 20"
          backgroundColor="rgba(255,255,255,0.06)"
          foregroundColor="rgba(255,255,255,0.13)"
        >
          <rect x="0" y="4" rx="6" ry="6" width="120" height="13" />
        </ContentLoader>
      </td>

      {/* Base */}
      <td>
        <ContentLoader
          speed={1.4}
          width={110}
          height={20}
          viewBox="0 0 110 20"
          backgroundColor="rgba(255,255,255,0.06)"
          foregroundColor="rgba(255,255,255,0.13)"
        >
          <rect x="0" y="4" rx="6" ry="6" width="90" height="13" />
        </ContentLoader>
      </td>

      {/* State — badge-shaped pill */}
      <td>
        <ContentLoader
          speed={1.4}
          width={80}
          height={24}
          viewBox="0 0 80 24"
          backgroundColor="rgba(255,255,255,0.06)"
          foregroundColor="rgba(255,255,255,0.13)"
        >
          <rect x="0" y="0" rx="12" ry="12" width="74" height="24" />
        </ContentLoader>
      </td>

      {/* Resources — two badge pills */}
      <td>
        <ContentLoader
          speed={1.4}
          width={170}
          height={24}
          viewBox="0 0 170 24"
          backgroundColor="rgba(255,255,255,0.06)"
          foregroundColor="rgba(255,255,255,0.13)"
        >
          <rect x="0" y="0" rx="12" ry="12" width="74" height="24" />
          <rect x="84" y="0" rx="12" ry="12" width="82" height="24" />
        </ContentLoader>
      </td>

      {/* Created At */}
      <td>
        <ContentLoader
          speed={1.4}
          width={180}
          height={20}
          viewBox="0 0 180 20"
          backgroundColor="rgba(255,255,255,0.06)"
          foregroundColor="rgba(255,255,255,0.13)"
        >
          <rect x="0" y="4" rx="6" ry="6" width="160" height="13" />
        </ContentLoader>
      </td>

      {/* Actions — two icon circles */}
      <td>
        <div className="flex items-center justify-center gap-2 p-1">
          <ContentLoader
            speed={1.4}
            width={28}
            height={28}
            viewBox="0 0 28 28"
            backgroundColor="rgba(255,255,255,0.06)"
            foregroundColor="rgba(255,255,255,0.13)"
          >
            <circle cx="14" cy="14" r="14" />
          </ContentLoader>
          <ContentLoader
            speed={1.4}
            width={28}
            height={28}
            viewBox="0 0 28 28"
            backgroundColor="rgba(255,255,255,0.06)"
            foregroundColor="rgba(255,255,255,0.13)"
          >
            <circle cx="14" cy="14" r="14" />
          </ContentLoader>
          <ContentLoader
            speed={1.4}
            width={28}
            height={28}
            viewBox="0 0 28 28"
            backgroundColor="rgba(255,255,255,0.06)"
            foregroundColor="rgba(255,255,255,0.13)"
          >
            <circle cx="14" cy="14" r="14" />
          </ContentLoader>
        </div>
      </td>
    </tr>
  );
}

export default ProjectRowSkeleton;
