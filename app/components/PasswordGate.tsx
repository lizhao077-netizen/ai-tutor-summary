"use client";

interface Props {
  password: string;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
}

export default function PasswordGate({ password, onPasswordChange, onSubmit }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">AI 课后总结助手</h1>
        <p className="text-sm text-gray-400 mb-10">30 秒生成专业家长反馈</p>

        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          placeholder="请输入访问密码"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-gray-300 text-base"
        />

        <button
          onClick={onSubmit}
          className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-base"
        >
          进入
        </button>
      </div>
    </div>
  );
}
