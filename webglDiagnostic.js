// WebGL 詳細診断システム
class WebGLDiagnostic {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.diagnosticInfo = {
            supported: false,
            context: null,
            vendor: null,
            renderer: null,
            version: null,
            extensions: [],
            maxTextureSize: 0,
            maxViewportDims: [],
            errors: [],
            warnings: [],
            recommendations: []
        };
    }
    
    // 包括的WebGL診断
    async runDiagnostic() {
        console.log('🔍 WebGL診断を開始します...');
        
        try {
            // Step 1: 基本サポート確認
            this.checkBasicSupport();
            
            // Step 2: コンテキスト取得試行
            await this.attemptContextCreation();
            
            // Step 3: 詳細情報取得
            if (this.gl) {
                this.gatherDetailedInfo();
                this.checkCapabilities();
                this.detectCommonIssues();
            }
            
            // Step 4: 推奨事項生成
            this.generateRecommendations();
            
        } catch (error) {
            this.diagnosticInfo.errors.push(`診断中にエラー: ${error.message}`);
        }
        
        return this.diagnosticInfo;
    }
    
    // 基本サポート確認
    checkBasicSupport() {
        // Canvas要素作成テスト
        try {
            this.canvas = document.createElement('canvas');
            this.diagnosticInfo.supported = true;
        } catch (error) {
            this.diagnosticInfo.errors.push('Canvas要素が作成できません');
            this.diagnosticInfo.supported = false;
            return;
        }
        
        // WebGL APIの存在確認
        if (!window.WebGLRenderingContext) {
            this.diagnosticInfo.errors.push('WebGL APIが利用できません');
            this.diagnosticInfo.supported = false;
        }
    }
    
    // コンテキスト取得試行
    async attemptContextCreation() {
        if (!this.canvas) return;
        
        const contextOptions = [
            // 標準的な設定
            {
                alpha: true,
                antialias: true,
                depth: true,
                stencil: false,
                preserveDrawingBuffer: false,
                powerPreference: "high-performance"
            },
            // フォールバック設定1: アンチエイリアス無効
            {
                alpha: true,
                antialias: false,
                depth: true,
                stencil: false,
                preserveDrawingBuffer: false
            },
            // フォールバック設定2: 最小限
            {
                alpha: false,
                antialias: false,
                depth: false,
                stencil: false
            }
        ];
        
        // WebGL 2.0 試行
        for (let options of contextOptions) {
            try {
                this.gl = this.canvas.getContext('webgl2', options);
                if (this.gl) {
                    this.diagnosticInfo.context = 'webgl2';
                    this.diagnosticInfo.version = 'WebGL 2.0';
                    console.log('✅ WebGL 2.0 コンテキスト取得成功');
                    return;
                }
            } catch (error) {
                this.diagnosticInfo.warnings.push(`WebGL 2.0 取得失敗: ${error.message}`);
            }
        }
        
        // WebGL 1.0 試行
        for (let options of contextOptions) {
            try {
                this.gl = this.canvas.getContext('webgl', options) || 
                         this.canvas.getContext('experimental-webgl', options);
                if (this.gl) {
                    this.diagnosticInfo.context = 'webgl';
                    this.diagnosticInfo.version = 'WebGL 1.0';
                    console.log('✅ WebGL 1.0 コンテキスト取得成功');
                    return;
                }
            } catch (error) {
                this.diagnosticInfo.warnings.push(`WebGL 1.0 取得失敗: ${error.message}`);
            }
        }
        
        // 全て失敗
        this.diagnosticInfo.errors.push('WebGLコンテキストの取得に失敗しました');
        this.diagnosticInfo.supported = false;
    }
    
    // 詳細情報収集
    gatherDetailedInfo() {
        if (!this.gl) return;
        
        try {
            // ベンダー情報
            this.diagnosticInfo.vendor = this.gl.getParameter(this.gl.VENDOR) || 'Unknown';
            this.diagnosticInfo.renderer = this.gl.getParameter(this.gl.RENDERER) || 'Unknown';
            
            // バージョン情報
            const version = this.gl.getParameter(this.gl.VERSION);
            this.diagnosticInfo.version = version || 'Unknown';
            
            // GLSL バージョン
            const glslVersion = this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION);
            this.diagnosticInfo.glslVersion = glslVersion || 'Unknown';
            
            // 拡張機能
            const extensions = this.gl.getSupportedExtensions() || [];
            this.diagnosticInfo.extensions = extensions;
            
            // 能力値
            this.diagnosticInfo.maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE) || 0;
            this.diagnosticInfo.maxViewportDims = this.gl.getParameter(this.gl.MAX_VIEWPORT_DIMS) || [0, 0];
            this.diagnosticInfo.maxVertexAttribs = this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS) || 0;
            this.diagnosticInfo.maxFragmentUniformVectors = this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS) || 0;
            
            console.log('📊 WebGL詳細情報収集完了');
            
        } catch (error) {
            this.diagnosticInfo.warnings.push(`詳細情報取得エラー: ${error.message}`);
        }
    }
    
    // 能力チェック
    checkCapabilities() {
        if (!this.gl) return;
        
        // テクスチャサイズチェック
        if (this.diagnosticInfo.maxTextureSize < 2048) {
            this.diagnosticInfo.warnings.push('テクスチャサイズが小さい可能性があります');
        }
        
        // フロートテクスチャサポート
        const floatTextures = this.gl.getExtension('OES_texture_float');
        if (!floatTextures) {
            this.diagnosticInfo.warnings.push('浮動小数点テクスチャがサポートされていません');
        }
        
        // インスタンス描画サポート
        const instancedArrays = this.gl.getExtension('ANGLE_instanced_arrays');
        if (!instancedArrays) {
            this.diagnosticInfo.warnings.push('インスタンス描画がサポートされていません');
        }
    }
    
    // 一般的な問題の検出
    detectCommonIssues() {
        // ソフトウェアレンダリング検出
        const renderer = this.diagnosticInfo.renderer.toLowerCase();
        if (renderer.includes('software') || renderer.includes('microsoft')) {
            this.diagnosticInfo.warnings.push('ソフトウェアレンダリングが使用されている可能性があります');
        }
        
        // 古いドライバー検出
        if (renderer.includes('intel') && !renderer.includes('iris')) {
            this.diagnosticInfo.warnings.push('古いIntelグラフィックドライバーの可能性があります');
        }
        
        // メモリ制限検出
        if (this.diagnosticInfo.maxTextureSize < 4096) {
            this.diagnosticInfo.warnings.push('メモリまたはグラフィック性能が制限されている可能性があります');
        }
    }
    
    // 推奨事項生成
    generateRecommendations() {
        if (!this.diagnosticInfo.supported) {
            this.diagnosticInfo.recommendations.push('WebGL対応ブラウザを使用してください');
            return;
        }
        
        if (this.diagnosticInfo.warnings.length === 0) {
            this.diagnosticInfo.recommendations.push('WebGLは正常に動作しています');
            return;
        }
        
        // 警告に基づく推奨事項
        if (this.diagnosticInfo.warnings.some(w => w.includes('ソフトウェア'))) {
            this.diagnosticInfo.recommendations.push('ハードウェアアクセラレーションを有効にしてください');
        }
        
        if (this.diagnosticInfo.warnings.some(w => w.includes('Intel'))) {
            this.diagnosticInfo.recommendations.push('Intelグラフィックドライバーを更新してください');
        }
        
        if (this.diagnosticInfo.warnings.some(w => w.includes('テクスチャ'))) {
            this.diagnosticInfo.recommendations.push('グラフィック設定を低品質に変更してください');
        }
        
        // 一般的な推奨事項
        this.diagnosticInfo.recommendations.push('ブラウザを最新版に更新してください');
        this.diagnosticInfo.recommendations.push('他のタブを閉じてメモリを確保してください');
    }
    
    // レポート生成
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            browser: navigator.userAgent,
            ...this.diagnosticInfo
        };
        
        return report;
    }
    
    // ユーザーフレンドリーなメッセージ生成
    getUserMessage() {
        if (!this.diagnosticInfo.supported) {
            return {
                type: 'error',
                title: 'WebGLがサポートされていません',
                message: 'お使いのブラウザまたはシステムはWebGLをサポートしていません。',
                actions: ['モダンブラウザを使用する', 'システムを更新する']
            };
        }
        
        if (this.diagnosticInfo.errors.length > 0) {
            return {
                type: 'error',
                title: 'WebGL初期化エラー',
                message: 'WebGLの初期化中にエラーが発生しました。',
                actions: this.diagnosticInfo.recommendations
            };
        }
        
        if (this.diagnosticInfo.warnings.length > 0) {
            return {
                type: 'warning',
                title: 'WebGLパフォーマンス警告',
                message: '最適なパフォーマンスでない可能性があります。',
                actions: this.diagnosticInfo.recommendations
            };
        }
        
        return {
            type: 'success',
            title: 'WebGL正常動作',
            message: 'WebGLは正常に動作しています。',
            actions: []
        };
    }
    
    // WebGL修復試行
    static async attemptRepair() {
        console.log('🔧 WebGL修復を試行します...');
        
        const repairs = [
            // キャッシュクリア
            () => {
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    });
                }
            },
            
            // ガベージコレクション強制実行
            () => {
                if (window.gc) {
                    window.gc();
                }
            },
            
            // WebGL状態リセット
            () => {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl');
                if (gl) {
                    gl.getExtension('WEBGL_lose_context')?.loseContext();
                }
            }
        ];
        
        for (let repair of repairs) {
            try {
                await repair();
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.warn('修復処理エラー:', error);
            }
        }
        
        console.log('✅ WebGL修復処理完了');
    }
}

// グローバルアクセス用
window.WebGLDiagnostic = WebGLDiagnostic;