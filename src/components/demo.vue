<template>
  <div class="config-container" @mousewheel="zoomInOut">
    <!-- <div class="title">
      <h2>业务配置</h2>
    </div> -->
    <!-- <svg viewBox="0 0 800 800" preserveAspectRatio="xMinYMin meet" id="svgContainer" class="svgContainer"></svg> -->
    <!-- <div :style="containerWH">
      <svg viewBox="0 0 3000 6000" preserveAspectRatio="xMinYMin meet" id="svgContainer" class="svgContainer"></svg>
    </div> -->
    <Button type="primary" class="startProcess" size="large" @click="startProcess" v-if="showStartBtn">开始流程</Button>
    <svg id="svgContainer" class="svgContainer"></svg>
    <context-menu :items="menuList" @chooseItem="chooseItem" v-if="showContextMenu"></context-menu>
    <transition name="fade">
      <div class="editNodeAttr" v-if="showEditNode">
        <div class="title">
          <h3>编辑属性值</h3>
        </div>
        <div class="formContent">
          <Form :model="nodeAttr" :label-width="100" ref="nodeAttr">
            <Form-item label="节点名称" prop="nodeName" style="margin-top: 20px">
              <Input v-model="nodeAttr.nodeName"/>
            </Form-item>
            <Form-item label="语音内容" prop="voiceContent" style="margin-top: 20px">
              <Input v-model="nodeAttr.voiceContent" :rows="5" type="textarea" placeholder="请输入..."/>
            </Form-item>
            <Form-item label="模型版本" prop="modelId" style="margin-top: 20px">
              <Select v-model="nodeAttr.modelId" style="width: 100%" placeholder="请选择">
                <Option value="ID001" :key="1">{{nodeAttr.nodeName+" v0.1.1"}}</Option>
                <Option value="ID002" :key="2">{{nodeAttr.nodeName+" v0.1.2"}}</Option>
                <Option value="ID003" :key="3">{{nodeAttr.nodeName+" v0.1.3"}}</Option>
              </Select>
            </Form-item>
            <!--是否完成-->
            <Form-item label="短信内容" prop="message" style="margin-top: 20px" v-if="editNode.leafCount===0">
              <Input v-model="nodeAttr.message" :rows="5" type="textarea" placeholder="请输入..."/>
            </Form-item>
            <Form-item label="处理结果" prop="result" style="margin-top: 20px" v-if="editNode.leafCount===0">
              <Select v-model="nodeAttr.result" style="width: 100%" placeholder="请选择">
                <Option value="1">同意</Option>
                <Option value="0">拒绝</Option>
              </Select>
            </Form-item>
            <Form-item class="controller">
              <Button type="primary" @click="submitEditNode">确认修改</Button>
              <Button type="ghost" @click="showEditNode = false" style="margin-left: 8px">取消</Button>
            </Form-item>
          </Form>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import Snap from 'snapsvg'
import contextMenu from '../components/contextMenu.vue'
import dataMap from '@/data/yiche.js'
export default {
  components: {
    contextMenu
  },
  data () {
    return {
      svgInstance: {}, // svg实例
      fontSize: 14, // 普通节点fontsize
      conditionFontSize: 14, // 条件节点fontsize
      horizonSpace: 200, // 节点间的水平间隔
      verticalSpace: 40, // 节点间的垂直间隔
      rootPosition: {  // 根节点的坐上角坐标
        x: 50,
        y: 0
      },
      selectedNode: {}, // 鼠标单击选中的节点
      data: dataMap['data'],
      menuList: [ // 鼠标右键弹出菜单
        {
          name: '新增子节点',
          value: 1
        },
        {
          name: '删除子节点',
          value: 2
        },
        {
          name: '编辑子节点',
          value: 3
        }
      ],
      showContextMenu: false, // 是否应该展示鼠标右键菜单
      contextMenuIndex: '', // 当前选中的鼠标右键菜单的值
      contextMenuNode: {}, // 在哪个节点上点击了鼠标右键
      showEditNode: false, // 是否展示编辑节点属性框
      nodeAttr: {
        nodeName: '',
        voiceContent: '',
        message: '',
        modelId: '',
        result: ''
      },
      root: [], // 封装的节点对象
      containerWH: {
        width: '100%',
        height: '100%'
      },
      loadingFun: function () {},
      modifyConditionNode: false,
      modifyConditionNodeName: {
        oldName: '',
        nodeName: ''
      },
      currentConditionNode: {}, // 当前选中的条件节点对象
      scale: 1, // svg缩放倍数
      showStartBtn: false,
      editNode: {}
    }
  },
  methods: {
    /** @description 将每一个节点封装成SVG中的节点，带有左上角坐标
     *  @augments value 节点文本内容
     *  @augments no 节点id
     *  @augments x 节点左上角x坐标
     *  @augments y 节点左上角y坐标
     *  @returns 返回节点对象，包括节点内容，节点左上角坐标，节点的宽度、高度，子节点列表，子节点中叶子节点的个数(为了计算占用空间)
    */
    Node (value = '', no = '', condition = '', leafCount = 0, x = 0, y = 0, content = '', message = '', type = 'normal') {
      let obj = {}
      let width = this.getStrBytes(value) * this.fontSize / 2 + 20
      let height = this.fontSize + 20
      obj.value = value
      obj.no = no
      obj.x = x
      obj.y = y
      obj.width = width
      obj.height = height
      obj.leafCount = leafCount
      obj.condition = condition
      obj.children = []
      obj.type = type
      obj.content = content
      return obj
    },
    /** @description 定义一个条件节点 */
    ConditionNode (value = '') {
      let obj = {}
      let width = this.getStrBytes(value) * (this.conditionFontSize + 2) / 2 + 5
      let height = this.conditionFontSize + 10
      obj.value = value
      obj.width = width
      obj.height = height
      return obj
    },
    /** 圆形节点，即终止节点 */
    CircleNode (value = '', x = 0, y = 0, condition = '', type = 'stop') {
      let obj = {}
      obj.value = value
      obj.x = x
      obj.y = y
      obj.r = 20
      obj.condition = condition
      obj.type = type
      return obj
    },
    /** @description 画图片节点 */
    ImageNode (value, src, leafCount = 0, children = [], x = this.rootPosition.x, y = this.rootPosition.y, width = 50, height = 45, type = 'image') {
      let obj = {}
      obj.value = value
      obj.src = src
      obj.x = x
      obj.y = y
      obj.leafCount = leafCount
      obj.children = children
      obj.width = width
      obj.height = height
      obj.type = type
      return obj
    },
    /** @description 获取节点中叶子节点的个数，为了计算节点所占空间 */
    getLeafCount (data) {
      let temp = 0
      data.forEach(item => {
        if (item.type !== 'stop') {
          if (!item.children || item.children.length === 0 ||
             (item.children.length === 1 && item.children[0].type === 'stop')) {
            // 如果节点是叶子节点且不是终止节点
            this.$set(item, 'leafCount', 0)
            temp += 1
          } else if (item.children.length > 0) {
            // 如果节点不是叶子节点
            let subNodeLeaf = this.getLeafCount(item.children)
            this.$set(item, 'leafCount', subNodeLeaf)
            temp += subNodeLeaf
          }
        }
      })
      return temp
    },
    /** @description 获取字符串字节数，一个汉字两个字节 */
    getStrBytes (str) {
      return str.replace(/[^\x00-\xff]/g, 'aa').length
    },
    /** @description 画节点并给节点添加事件
     *  @augments node 文本节点
     *  @returns 返回文本和框线的组合对象
     */
    drawNode (node) {
      let _this = this
      let text = this.svgInstance.text(node.x + 10, node.y + this.fontSize + 8, node.value).attr({
        fontSize: this.fontSize,
        fill: '#333333'
      })
      let textNode = text.node.getBBox()
      node.width = textNode.width + 20
      let rect = this.svgInstance.rect(node.x, node.y, node.width, node.height, 2)
      rect.attr({
        fill: '#fff',
        stroke: '#333333',
        strokeWidth: 1
      })
      let g = this.svgInstance.g()
      g.add(rect, text)
      g.addClass('node _' + node.no)
      g.attr({
        cursor: 'pointer'
      })
      g.node.onclick = _this.onNodeClick(g, node, rect)
      g.node.oncontextmenu = _this.onContextMenu(g, node, rect)
      return node
    },
    /** @description 单击节点事件 */
    onNodeClick (g, node, rect) {
      let _this = this
      return function () {
        Snap.selectAll('.active rect').attr({
          stroke: '#c7d3e1'
        })
        g.addClass('active')
        rect.attr({
          stroke: '#198ae0'
        })
        _this.selectedNode = node
      }
    },
    /** @description 节点的鼠标右键事件 */
    onContextMenu (g, node, rect) {
      let _this = this
      return function () {
        Snap.selectAll('.active rect').attr({
          stroke: '#c7d3e1'
        })
        g.addClass('active')
        rect.attr({
          stroke: '#198ae0'
        })
        _this.showContextMenu = true
        _this.contextMenuNode = node
        _this.contextMenuIndex = 0
        _this.$nextTick(() => {
          document.querySelector('.contextMenu-Container').style.left = event.clientX - 200 + 'px'
          document.querySelector('.contextMenu-Container').style.top = event.clientY - 10 + 'px'
        })
        return false
      }
    },
    /** @description 画两条线之间的条件节点 */
    drawConditionNode (fromNode, toNode) {
      let _this = this
      let conditionNode = this.ConditionNode(toNode.condition)
      if (toNode.type === 'stop' && fromNode.leafCount === 0) {
        // 如果结束节点为终止节点，并且开始节点为叶子节点
        conditionNode.x = toNode.x - this.horizonSpace / 4 - toNode.r
        conditionNode.y = fromNode.y + 6
      } else if (toNode.type === 'stop' && fromNode.leafCount > 0) {
        // 如果结束节点为终止节点，并且开始节点为非叶子节点
        conditionNode.x = toNode.x - conditionNode.width / 2
        conditionNode.y = fromNode.y - this.horizonSpace / 2
      } else if (fromNode.y === toNode.y && (fromNode.leafCount === toNode.leafCount)) {
        // 如果开始节点和终止节点在同一条水平线上，并且开始节点的直接子节点只有一个（子节点为终止节点不算，故不能判断children的长度）
        conditionNode.x = toNode.x - this.horizonSpace / 2 - conditionNode.width / 2
        conditionNode.y = toNode.y + 6
      } else {
        // 如果开始节点和结束节点不在同一条水平线上
        conditionNode.x = toNode.x - 3 * this.horizonSpace / 8 - conditionNode.width / 2
        conditionNode.y = toNode.y + 6
      }
      let text = this.svgInstance.text(conditionNode.x + 5, conditionNode.y + this.fontSize + 2, conditionNode.value).attr({
        fontSize: this.conditionFontSize,
        fill: '#022a46'
      })
      // 节点宽度修正
      let textNode = text.node.getBBox()
      conditionNode.width = textNode.width + 10
      let rect = this.svgInstance.rect(conditionNode.x, conditionNode.y, conditionNode.width, conditionNode.height, 2)
      rect.attr({
        fill: '#c7d3e1'
      })
      let g = this.svgInstance.g()
      g.add(rect, text)
      g.addClass('conditionNode _' + toNode.no)
      g.attr({
        cursor: 'pointer'
      })
      g.node.ondblclick = function () {
        _this.modifyConditionNode = true
        _this.$nextTick(() => {
          _this.$refs['modifyConditionNodeName'].resetFields()
          _this.currentConditionNode = toNode
          _this.modifyConditionNodeName.oldName = toNode.condition
        })
      }
      return conditionNode
    },
    /** @description 画终止节点 */
    drawStopNode (node) {
      let circle = this.svgInstance.circle(node.x, node.y, node.r)
      circle.attr({
        fill: '#d53737'
      })
      let text = this.svgInstance.text(node.x - this.fontSize, node.y + this.fontSize / 2 - 1, node.value).attr({
        fontSize: this.conditionFontSize,
        fill: '#fff'
      })
      let g = this.svgInstance.g()
      g.add(circle, text)
      return node
    },
    /** @description 画图片节点 */
    drawImageNode (node) {
      let imageNode = this.svgInstance.image(node.src, node.x, node.y, node.width, node.height)
      let text = this.svgInstance.text(node.x + 10, node.y + node.height + 20, node.value).attr({
        fontSize: this.conditionFontSize,
        fill: '#333333'
      })
      let g = this.svgInstance.g()
      g.add(imageNode, text)
      return node
    },
    /** @description 画两个节点之间的线
     *  @augments fromNode 开始节点
     *  @augments toNode 截止节点
     */
    drawLine (fromNode, toNode) {
      let path = ''
      if (fromNode.type === 'normal' && toNode.type === 'normal') {
        path = `M${fromNode.x + fromNode.width} ${fromNode.y + fromNode.height / 2}
                L${fromNode.x + fromNode.width + this.horizonSpace / 4} ${fromNode.y + fromNode.height / 2}
                M${fromNode.x + fromNode.width + this.horizonSpace / 4} ${fromNode.y + fromNode.height / 2}
                L${fromNode.x + fromNode.width + this.horizonSpace / 4} ${toNode.y + toNode.height / 2}
                M${fromNode.x + fromNode.width + this.horizonSpace / 4} ${toNode.y + toNode.height / 2}
                L${toNode.x} ${toNode.y + toNode.height / 2}`
      } else if (toNode.type === 'stop' && fromNode.leafCount === 0) {
        // 叶子节点的终止条件显示到右侧
        path = `M${fromNode.x + fromNode.width} ${fromNode.y + fromNode.height / 2}
                L${toNode.x} ${toNode.y}`
      } else if (toNode.type === 'stop' && fromNode.leafCount > 0) {
        // 非叶子节点的终止条件显示到上方
        path = `M${fromNode.x + fromNode.width / 2} ${fromNode.y}
                L${toNode.x} ${toNode.y}`
      } else if (fromNode.type === 'image') {
        path = `M${fromNode.x + fromNode.width + 3} ${toNode.y + toNode.height / 2}
                L${toNode.x} ${toNode.y + toNode.height / 2}`
      }
      let line = this.svgInstance.path(path)
      line.attr({
        stroke: '#333333',
        strokeWidth: 1,
        'stroke-dasharray': '2, 2'
      })
      // 如果有条件则画条件框
      if (toNode.condition) {
        this.drawConditionNode(fromNode, toNode)
      }
    },
    /** @description 将数据封装成节点对象,并赋予节点位置信息
     *  @augments data 要展示的流程数据
     *  @augments parentNode 父节点
     */
    transformData (data, parentNode) {
      let _this = this
      let root = null
      let baseY = 0
      if (parentNode === null) {
        // root = this.Node(data[0].name, data[0].no, data[0].condition, data[0].leafCount, this.rootPosition.x, this.rootPosition.y)
        root = this.ImageNode(data[0].name, data[0].src, data[0].leafCount)
        // baseY =this.rootPosition.y - (root.leafCount - 1) * (root.height + this.verticalSpace) / 2
        baseY = root.y - (root.leafCount - 1) * (root.height + this.verticalSpace) / 2
        if (baseY < 0) {
          this.rootPosition.y -= baseY
          return null
        } else {
          data = data[0].children
          this.transformData(data, root)
        }
      } else {
        root = parentNode
        let childNodesX = root.x + root.width + this.horizonSpace
        baseY = root.y - (root.leafCount - 1) * (root.height + this.verticalSpace) / 2
        data.forEach(function (item, i) {
          // 如果节点不是终止节点
          if (!item.type || item.type !== 'stop') {
            let PosY = 0
            let leafCount = item.leafCount === 0 ? 1 : item.leafCount
            if (i === 0) {
              PosY = baseY + (leafCount - 1) * (root.height + _this.verticalSpace) / 2
            } else {
              let preNode = root.children[i - 1]
              let perNodeLeaf = preNode.leafCount === 0 ? 1 : preNode.leafCount
              let base = preNode.y + (perNodeLeaf + 1) * (preNode.height + _this.verticalSpace) / 2
              PosY = base + (leafCount - 1) * (root.height + _this.verticalSpace) / 2
            }
            let node = _this.Node(item.name, item.no, item.condition, item.leafCount, childNodesX, PosY, item.content)
            root.children.push(node)
            if (item.children && item.children.length > 0) {
              _this.transformData(item.children, node)
            }
          } else if (root.leafCount > 0) {
            // 如果节点是终止节点且父节点除终止节点外还有其他节点，将终止节点显示到父节点上方
            let node = _this.CircleNode(item.name, root.x + root.width / 2, root.y - _this.horizonSpace, item.condition)
            root.children.push(node)
          } else {
            // 如果节点是终止节点且父节点为叶子节点，将终止节点显示到父元素右侧
            let node = _this.CircleNode(item.name, childNodesX - _this.horizonSpace / 2, root.y + root.height / 2, item.condition)
            root.children.push(node)
          }
        })
      }
      return root
    },
    /** @description 画树 */
    drawFlowChart (root) {
      let _this = this
      if (root.type === 'normal') {
        this.drawNode(root)
      } else if (root.type === 'stop') {
        this.drawStopNode(root)
      } else if (root.type === 'image') {
        this.drawImageNode(root)
      }
      if (root.children && root.children.length > 0) {
        root.children.forEach(function (item) {
          _this.drawLine(root, item)
          _this.drawFlowChart(item)
        })
      }
    },
    /** @description init
     */
    initSVG () {
      this.svgInstance = Snap('#svgContainer')
      window.test = this.svgInstance
      this.svgInstance.drag()
      this.getLeafCount(this.data)
      this.root = this.transformData(this.data, null)
      if (this.root === null) {
        this.root = this.transformData(this.data, null)
      }
      this.drawFlowChart(this.root)
    },
    /** @description 选择鼠标右键弹出的菜单的菜单项 */
    chooseItem (value) {
      this.showContextMenu = false
      this.contextMenuIndex = value
      if (this.contextMenuIndex === 1) {
        this.contextMenuNode.value = 1
      } else if (this.contextMenuIndex === 2) {
        console.log('删除子节点')
      } else if (this.contextMenuIndex === 3) {
        this.showEditNode = true
        this.nodeAttr.nodeName = this.contextMenuNode.value
        this.nodeAttr.voiceContent = this.contextMenuNode.content
        this.nodeAttr.message = this.contextMenuNode.message
        this.editNode = this.contextMenuNode
      }
    },
    /** @description 在界面上点击鼠标关闭鼠标右键菜单 */
    hideContextMenu () {
      this.showContextMenu = false
      // this.contextMenuNode = {}
    },
    /** 关闭编辑属性值界面 */
    submitEditNode () {
      this.changeNodeView()
    },
    changeNodeView () {
      this.showEditNode = false
      this.contextMenuNode.value = this.nodeAttr.nodeName
      this.contextMenuNode.content = this.nodeAttr.voiceContent
      this.contextMenuNode.message = this.nodeAttr.message
      let className = '.node._' + this.contextMenuNode.no + ' text'
      let textEle = this.svgInstance.select(className)
      textEle.node.innerHTML = this.nodeAttr.nodeName
      let rectName = '.node._' + this.contextMenuNode.no + ' rect'
      let rectEle = this.svgInstance.select(rectName)
      rectEle.node.style.width = this.getStrBytes(this.nodeAttr.nodeName) * this.fontSize / 2 + 20
    },
    zoomInOut (event) {
      let matrix = (this.svgInstance.node.transform.animVal[0] && this.svgInstance.node.transform.animVal[0].matrix) || new Snap.Matrix(1, 0, 0, 1, 0, 0)
      let [a, b, c, d, e, f] = [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f]
      if (event && event.wheelDelta > 0) {
        a += 0.1
      } else if (event && event.wheelDelta < 0 && a >= 0.3) {
        a -= 0.1
      }
      d = a
      let m = new Snap.Matrix(a, b, c, d, e, f)
      this.svgInstance.transform(m)
    },
    submitNodeName () {
      this.modifyConditionNode = false
      this.currentConditionNode.condition = this.modifyConditionNodeName.nodeName
      let className = '.conditionNode._' + this.currentConditionNode.no + ' text'
      let rectName = '.conditionNode._' + this.currentConditionNode.no + ' rect'
      let textEle = this.svgInstance.select(className)
      let rectEle = this.svgInstance.select(rectName)
      textEle.node.innerHTML = this.modifyConditionNodeName.nodeName
      rectEle.node.style.width = this.getStrBytes(this.modifyConditionNodeName.nodeName) * (this.conditionFontSize + 2) / 2 + 10
    },
    cancel () {
      this.modifyConditionNode = false
    },
    startProcess () {
      this.axios.get('/orderMessage/guahao.do')
      .then((res) => {
        this.loadingFun()
        if (res.data.returnCode === '1') {
          this.$Message.success('流程开启成功')
        } else {
          this.$Message.error('流程开启失败')
        }
      })
    }
  },
  // watch: {
  //   '$route' (to, from) {
  //     this.rootPosition = {  // 根节点的坐上角坐标
  //       x: 50,
  //       y: 100
  //     }
  //     let m = new Snap.Matrix(1, 0, 0, 1, 0, 0)
  //     this.svgInstance.transform(m)
  //     if (Object.keys(this.svgInstance).length) {
  //       this.svgInstance.clear()
  //       this.data = dataMap[to.params.path]
  //       this.initSVG()
  //     }
  //     if (~to.path.indexOf('data2')) {
  //       this.showStartBtn = true
  //       // let m = new Snap.Matrix(0.8, 0, 0, 0.8, -380, -827)
  //       // // 旋转
  //       // this.svgInstance.transform(m)
  //     } else {
  //       this.showStartBtn = false
  //       // let m = new Snap.Matrix(0.5, 0, 0, 0.5, -959, -3109)
  //       // // 旋转
  //       // this.svgInstance.transform(m)
  //     }
  //     this.showEditNode = false
  //   }
  // },
  mounted () {
    this.initSVG()
    document.onclick = this.hideContextMenu
    if (~this.$route.path.indexOf('data2')) {
      this.showStartBtn = true
    } else {
      this.showStartBtn = false
    }
  }
}
</script>
<style lang='less' scoped>
@titleHeight: 10px;
.config-container {
  box-sizing: border-box;
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  -moz-user-select: none; 
  -khtml-user-select: none;
  user-select: none;
  // width: 2000px;
  // height: 2000px;
  color: #333333; 
  .title {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    border-bottom: 1px solid #e7edf4;
    h2, h3 {
      float: left;
      font-size: 14px;
      font-weight: normal;
      letter-spacing: 1px;
      border-bottom: 2px solid #84c3e9;
      line-height:40px;
      padding: 0 20px;
    }
    h3 {
      font-weight: bold;
      border-bottom: none;
    }
  }
  .svgContainer {
    width:4000px;
    height:7000px;
    overflow: visible;
  }
  .editNodeAttr {
    position: absolute;
    right: 0;
    top: 2px;
    width: 540px;
    bottom: 2px;
    box-sizing: border-box;
    background: #eff3f5;
    box-shadow: -1px 0px 5px #ccc;
  }
  .formContent {
    position: absolute;
    top: 40px;
    left: 10px;
    right: 20px;
    bottom: 0;
    .ivu-input-wrapper {
      width: 100%;
    }
    .controller {
      position: absolute;
      bottom: 10px;
      right: 0;
    }
  }
  .modifyNodeName {
    .ivu-input-wrapper {
      width: 100%;
    }
  }
  .fade-enter-active {
    transition: width .1s
  }
  .fade-leave-active {
    transition: width .3s
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active in below version 2.1.8 */ {
    width: 0px;
  }
  .startProcess {
    position: absolute;
    top: 10px;
    left: 20px;
  }
}
</style>
