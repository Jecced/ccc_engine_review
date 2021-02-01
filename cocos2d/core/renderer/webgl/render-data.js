import FlexBuffer from "./flex-buffer";
import { vfmtPosUvColor } from './vertex-format';

export default function RenderData () {
    // 这三个Data都是二维数组
    // uv顶点数据的缓存, 一个是float, 一个是uint
    this.vDatas = [];//Array<Float32Array>
    this.uintVDatas = [];//Array<Uint32Array>
    // 三角形顶点索引缓存
    this.iDatas = [];//Array<Uint16Array>
    // 记录上面的数组数据的length
    this.meshCount = 0;

    this._infos = null;
    this._flexBuffer = null;
}

cc.js.mixin(RenderData.prototype, {
    init (assembler) {
    },
    clear () {
        this.vDatas.length = 0;
        this.iDatas.length = 0;
        this.uintVDatas.length = 0;
        this.meshCount = 0;

        this._infos = null;

        if (this._flexBuffer) {
            this._flexBuffer.reset();
        }
    },

    /**
     * 更新mesh中第index位置的数据
     * @param index
     * @param vertices
     * @param indices
     */
    updateMesh (index, vertices, indices) {
        this.vDatas[index] = vertices;
        this.uintVDatas[index] = new Uint32Array(vertices.buffer, 0, vertices.length);
        this.iDatas[index] = indices;

        this.meshCount = this.vDatas.length;
    },

    updateMeshRange (verticesCount, indicesCount) {
    },

    /**
     * 初始化缓存空间[uv和索引]
     * @param index 0
     * @param verticesFloats 共需要的空间大小
     * @param indicesCount 三角形顶点个数
     */
    createData (index, verticesFloats, indicesCount) {
        let vertices = new Float32Array(verticesFloats);
        let indices = new Uint16Array(indicesCount);
        // 将初始化好的缓存, 存进vDatas,uintVDatas,iDatas
        this.updateMesh(index, vertices, indices);
    },

    /**
     * 创建初始四数据?, 由assembler-2d.initData调用
     * 初始化缓存空间, 设置进对应的vDatas,uintVDatas,iDatas
     * 初始化四索引?数据
     * @param index 0
     * @param verticesFloats 共需要的空间大小
     * @param indicesCount 三角形顶点个数
     */
    createQuadData (index, verticesFloats, indicesCount) {
        this.createData(index, verticesFloats, indicesCount);
        this.initQuadIndices(this.iDatas[index]);
    },

    createFlexData (index, verticesFloats, indicesCount, vfmt) {
        vfmt = vfmt || vfmtPosUvColor;
        this._flexBuffer = new FlexBuffer(this, index, verticesFloats, indicesCount, vfmt);
    },

    initQuadIndices(indices) {
        let count = indices.length / 6;
        for (let i = 0, idx = 0; i < count; i++) {
            let vertextID = i * 4;
            indices[idx++] = vertextID;
            indices[idx++] = vertextID+1;
            indices[idx++] = vertextID+2;
            indices[idx++] = vertextID+1;
            indices[idx++] = vertextID+3;
            indices[idx++] = vertextID+2;
        }
    }
})

cc.RenderData = RenderData;

