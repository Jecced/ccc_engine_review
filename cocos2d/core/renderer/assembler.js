import { vfmtPosUvColor } from './webgl/vertex-format';
import assemblerPool from './assembler-pool';

export default class Assembler {
    constructor () {
        this._extendNative && this._extendNative();
    }
    init (renderComp) {
        this._renderComp = renderComp;
    }

    updateRenderData (comp) {
    }

    fillBuffers (comp, renderer) {
    }

    getVfmt () {
        return vfmtPosUvColor;
    }
}


// 将 assembler Clazz 绑定到 render 组件的静态参数内
Assembler.register = function (renderCompCtor, assembler) {
    renderCompCtor.__assembler__ = assembler;
};

// 初始化, 传入组件实例
Assembler.init = function (renderComp) {
    // render 组件Clazz
    let renderCompCtor = renderComp.constructor;
    // 找到组件中静态参数__assembler__ 绑定的自定义渲染Clazz
    let assemblerCtor =  renderCompCtor.__assembler__;
    // 递归去超类中找到绑定过的assembler
    while (!assemblerCtor) {
        renderCompCtor = renderCompCtor.$super;
        if (!renderCompCtor) {
            cc.warn(`Can not find assembler for render component : [${cc.js.getClassName(renderComp)}]`);
            return;
        }
        assemblerCtor =  renderCompCtor.__assembler__;
    }
    // 如果assembler中有自定义获取构造器的function, 则使用自定义的构造器
    if (assemblerCtor.getConstructor) {
        assemblerCtor = assemblerCtor.getConstructor(renderComp);
    }

    // 组件中没有初始化assembler, 或者组件中assembler不是刚刚找到的assembler类, 则重新实例化
    if (!renderComp._assembler || renderComp._assembler.constructor !== assemblerCtor) {
        // 从assembler对象池中复用已经实例化好的, 如果没有找到则执行new操作
        let assembler = assemblerPool.get(assemblerCtor);

        // 双向绑定
        // 执行初始化操作, 默认将组件实例放入assembler实例的_renderComp成员变量中
        assembler.init(renderComp);
        // 将assembler实例放入组件历史_assembler实例中
        renderComp._assembler = assembler;
    }
};

cc.Assembler = Assembler;
