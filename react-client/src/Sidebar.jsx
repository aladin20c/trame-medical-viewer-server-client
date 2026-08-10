import { useState } from 'react';
import RenderTab from './tabs/RenderTab';
import ViewTab from './tabs/ViewTab';
import AdjustTab from './tabs/AdjustTab';
import ToolsTab from './tabs/ToolsTab';

// ---------- Common UI Styles ----------
const uiStyles = {
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'rgba(255, 255, 255, 0.35)',
    marginBottom: '10px',
  },
  sliderGroup: {
    marginBottom: '10px',
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    marginBottom: '4px',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  value: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontVariantNumeric: 'tabular-nums',
  },
  slider: {
    width: '100%',
    height: '2px',
    appearance: 'none',
    background: 'rgba(255, 255, 255, 0.12)',
    borderRadius: '1px',
    outline: 'none',
    cursor: 'pointer',
  },
  select: {
    width: '100%',
    padding: '6px 10px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '6px',
  },
  button: {
    width: '100%',
    padding: '6px 10px',
    marginBottom: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  buttonGroup: {
    display: 'flex',
    gap: '4px',
    marginBottom: '6px',
  },
  smallButton: {
    flex: 1,
    padding: '5px 8px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
    textAlign: 'center',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  toggleLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  toggleButton: (active) => ({
    width: '32px',
    height: '18px',
    borderRadius: '9px',
    background: active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
    padding: 0,
  }),
  toggleKnob: (active) => ({
    position: 'absolute',
    top: '2px',
    left: active ? '16px' : '2px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.2s',
  }),
};

// ---------- Sidebar Layout Styles ----------
const sidebarStyles = {
  sidebar: (isHovered) => ({
    position: 'absolute',
    right: '24px',
    top: '24px',
    bottom: '24px',
    width: '260px',
    background: isHovered 
      ? 'rgba(20, 20, 20, 0.85)' 
      : 'rgba(20, 20, 20, 0.4)',
    backdropFilter: isHovered ? 'blur(20px)' : 'blur(8px)',
    borderRadius: '16px',
    padding: '16px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: isHovered 
      ? '1px solid rgba(255, 255, 255, 0.15)' 
      : '1px solid rgba(255, 255, 255, 0.06)',
    boxShadow: isHovered 
      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
      : '0 4px 16px rgba(0, 0, 0, 0.15)',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  tabs: {
    display: 'flex',
    gap: '2px',
    marginBottom: '16px',
    padding: '2px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
  },
  tab: (isActive) => ({
    flex: 1,
    padding: '6px 8px',
    fontSize: '11px',
    fontWeight: '500',
    textAlign: 'center',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s',
    background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    color: isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
    border: 'none',
    fontFamily: 'inherit',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }),
  scrollArea: {
    overflowY: 'auto',
    flex: 1,
    paddingRight: '6px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
  },
};

const TABS = {
  RENDER: 'Render',
  VIEW: 'View',
  ADJUST: 'Adjust',
  TOOLS: 'Tools',
};

function Sidebar({ resolution, onResolutionChange, onTrigger }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.RENDER);

  return (
    <div
      style={sidebarStyles.sidebar(isHovered)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={sidebarStyles.tabs}>
        {Object.values(TABS).map(tab => (
          <button
            key={tab}
            style={sidebarStyles.tab(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={sidebarStyles.scrollArea}>
        {activeTab === TABS.RENDER && (
          <RenderTab
            resolution={resolution}
            onResolutionChange={onResolutionChange}
            onTrigger={onTrigger}
            styles={uiStyles}
          />
        )}
        {activeTab === TABS.VIEW && (
          <ViewTab onTrigger={onTrigger} styles={uiStyles} />
        )}
        {activeTab === TABS.ADJUST && (
          <AdjustTab onTrigger={onTrigger} styles={uiStyles} />
        )}
        {activeTab === TABS.TOOLS && (
          <ToolsTab onTrigger={onTrigger} styles={uiStyles} />
        )}
      </div>
    </div>
  );
}

export default Sidebar;