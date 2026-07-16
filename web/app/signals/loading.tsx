import Link from "next/link";

// Streams immediately while SignalsPage fetches klines/fundamentals and runs
// DeepSeek scoring — a cold (uncached) load takes ~2 minutes, and without this
// the browser sits on the previous page as if /signals were broken.
export default function SignalsLoading() {
  return (
    <div className="container">
      <Link href="/" className="back-link">返回股票池</Link>
      <header className="page-header compact">
        <div>
          <div className="eyebrow">Live scoring</div>
          <h1>实时信号</h1>
          <p>以 PEG 和利润增速/估值匹配为主，短期价格指标降权，生成 5-20 个交易日动作建议。</p>
        </div>
      </header>
      <div className="theme-panel">
        <div className="theme-title">
          <strong>信号列表</strong>
          <span>正在拉取行情并调用 DeepSeek 评分…首次加载约需 2 分钟，之后 12 小时内秒开</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>代码</th>
                <th>名称</th>
                <th>主题</th>
                <th>动作</th>
                <th className="num">现价</th>
                <th className="num">置信度</th>
                <th className="num">仓位</th>
                <th className="num">PE(TTM)</th>
                <th className="num">利润同比</th>
                <th className="num">PEG</th>
                <th>理由</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, i) => (
                <tr key={i}>
                  {Array.from({ length: 11 }, (_, j) => (
                    <td key={j}>
                      <span className="skeleton" style={{ width: j === 10 ? "80%" : undefined }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
