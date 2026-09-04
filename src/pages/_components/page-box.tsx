import { ExtraContent } from '@/layouts/extraRender';
import {
  PageContainer,
  RouteContext,
  type PageContainerProps
} from '@ant-design/pro-components';
import {
  HeaderSlotContext,
  useOverlayScroller,
  type HeaderSlotContextValue
} from '@gpustack/core-ui';
import { useIntl, useLocation } from '@umijs/max';
import { Divider } from 'antd';
import classNames from 'classnames';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { getPageSubtitleId } from './page-subtitles';
import pageBoxCss from './styles/page-box.less';

type PageSurface = 'card' | 'canvas';

const PageSurfaceContext = createContext<{
  setSurface: (surface: PageSurface) => void;
}>({
  setSurface: () => undefined
});

export const usePageSurface = (surface: PageSurface) => {
  const { setSurface } = useContext(PageSurfaceContext);

  useEffect(() => {
    setSurface(surface);
    return () => setSurface('card');
  }, [setSurface, surface]);
};

// The header-slot bridge (HeaderSlotContext, HeaderLeft, HeaderRight,
// usePageContentStyle) lives in @gpustack/core-ui so the host and the
// enterprise plugin share the SAME context instance and can portal into this
// layout-owned header bar. Re-exported here so existing host import sites
// keep working.
export {
  HeaderLeft,
  HeaderRight,
  usePageContentStyle
} from '@gpustack/core-ui';

const paddingInlinePageContainerContent = 24;

export const PageContainerInner: React.FC<
  PageContainerProps & {
    styles?: {
      containerWrapper?: React.CSSProperties;
    };
  }
> = ({ children, styles, title, ...rest }) => {
  const { initialize: initialize } = useOverlayScroller({
    defer: false
  });
  const pageContext = useContext(RouteContext);
  const intl = useIntl();
  const location = useLocation();
  const subtitleId = getPageSubtitleId(location.pathname);
  const subtitle = subtitleId
    ? intl.formatMessage({ id: subtitleId })
    : undefined;
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [leftEl, setLeftEl] = useState<HTMLDivElement | null>(null);
  const [rightEl, setRightEl] = useState<HTMLDivElement | null>(null);
  const [contentStyleOverride, setContentStyleOverride] = useState<
    React.CSSProperties | undefined
  >(undefined);
  const [surface, setSurface] = useState<PageSurface>('card');

  useEffect(() => {
    if (contentWrapperRef.current) {
      const ins = initialize(contentWrapperRef.current);
      window.__GPUSTACK_BODY_SCROLLER__ = ins;
    }
  }, [initialize, contentWrapperRef]);

  const setContentStyle = useCallback(
    (style: React.CSSProperties | undefined) => {
      setContentStyleOverride(style);
      return () => setContentStyleOverride(undefined);
    },
    []
  );

  const slotOwnersRef = useRef<{ left: number; right: number }>({
    left: 0,
    right: 0
  });

  const registerSlot = useCallback((slot: 'left' | 'right') => {
    const owners = slotOwnersRef.current;
    owners[slot] += 1;
    if (process.env.NODE_ENV !== 'production' && owners[slot] > 1) {
      const name = slot === 'left' ? 'HeaderLeft' : 'HeaderRight';
      console.warn(
        `[PageContainerInner] ${owners[slot]} <${name}> are mounted at once; their content stacks in the same header slot. Only one page/component should own each slot at a time.`
      );
    }
    return () => {
      owners[slot] -= 1;
    };
  }, []);

  const slotValue = useMemo<HeaderSlotContextValue>(
    () => ({
      leftEl,
      rightEl,
      setContentStyle,
      registerSlot
    }),
    [leftEl, rightEl, setContentStyle, registerSlot]
  );

  return (
    <PageSurfaceContext.Provider value={{ setSurface }}>
      <HeaderSlotContext.Provider value={slotValue}>
        <div
          className={classNames(pageBoxCss.containerWrapper, {
            [pageBoxCss.canvas]: surface === 'canvas'
          })}
        >
          <div className={pageBoxCss.title}>
            <div className={pageBoxCss.left}>
              <div ref={setLeftEl} className={pageBoxCss.leftSlot} />
              <span className={pageBoxCss.defaultTitle}>
                <span className={pageBoxCss.defaultTitleText}>
                  {pageContext.title}
                </span>
                {subtitle && (
                  <span className={pageBoxCss.defaultSubtitle}>{subtitle}</span>
                )}
              </span>
            </div>
            <div className={pageBoxCss.right}>
              <div ref={setRightEl} className={pageBoxCss.rightSlot} />
              <Divider
                className={pageBoxCss.divider}
                orientation="vertical"
                style={{ margin: '0 16px', height: 20 }}
              />
              <ExtraContent />
            </div>
          </div>
          <PageContainer
            {...rest}
            fixedHeader={false}
            title={false}
            pageHeaderRender={false}
            style={{
              flex: 1
            }}
            token={{
              paddingInlinePageContainerContent:
                paddingInlinePageContainerContent
            }}
          >
            <div
              className={classNames(pageBoxCss.contentWrapper)}
              style={{ ...styles?.containerWrapper, ...contentStyleOverride }}
              ref={contentWrapperRef}
            >
              {children}
            </div>
          </PageContainer>
        </div>
      </HeaderSlotContext.Provider>
    </PageSurfaceContext.Provider>
  );
};

const PageBox: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  return <div style={style}>{children}</div>;
};

export default PageBox;
