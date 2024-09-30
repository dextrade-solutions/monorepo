import './index.scss';

export default function PulseLoader() {
  return (
    <div className="pulse-loader">
      <div className="pulse-loader__loading-dot-one" />
      <div className="pulse-loader__loading-dot-two" />
      <div className="pulse-loader__loading-dot-three" />
    </div>
  );
}
