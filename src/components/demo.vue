<template>
  <div class="config-container">
    <div class="title">
      <h2>业务配置</h2>
    </div>
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
              <Input v-model="nodeAttr.nodeName"></Input>
            </Form-item>
            <Form-item label="语音内容" prop="voiceContent" style="margin-top: 20px">
              <Input v-model="nodeAttr.voiceContent" :rows="5" type="textarea" placeholder="请输入..."></Input>
            </Form-item>
            <Form-item label="短信内容" prop="message" style="margin-top: 20px">
              <Input v-model="nodeAttr.message" :rows="5" type="textarea" placeholder="请输入..."></Input>
            </Form-item>
            <Form-item label="模型ID" prop="modelId" style="margin-top: 20px">
              <Select v-model="nodeAttr.modelId" style="width: 100%" placeholder="请选择">
                <Option value="ID001">ID001</Option>
                <Option value="ID002">ID002</Option>
                <Option value="ID003">ID003</Option>
              </Select>
            </Form-item>
            <Form-item label="处理结果" prop="result" style="margin-top: 20px">
              <Select v-model="nodeAttr.result" style="width: 100%" placeholder="请选择">
                <Option value="1">同意</Option>
                <Option value="0">拒绝</Option>
              </Select>
            </Form-item>
            <Form-item class="controller">
              <Button type="primary" @click="closeEditNode">确认修改</Button>
              <Button type="ghost" @click="closeEditNode" style="margin-left: 8px">取消</Button>
            </Form-item>
          </Form>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import Snap from 'snapsvg'
import contextMenu from './contextMenu.vue'
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
      verticalSpace: 80, // 节点间的垂直间隔
      rootPosition: {  // 根节点的坐上角坐标
        x: 50,
        y: 300
      },
      selectedNode: {}, // 鼠标单击选中的节点
      data: [  // 节点数据
        {
          name: '机器人',
          condition: '',
          type: 'image',
          src: 'static/img/robot.png',
          id: '1',
          children: [
            {
              name: '普通节点',
              condition: '',
              id: '11',
              children: [
                {
                  name: '普通节点',
                  condition: '是',
                  id: '1-1-1',
                  children: [
                    {
                      name: '普通节点',
                      condition: '是',
                      id: '1-1-1-1',
                      children: [
                        {
                          name: '普通节点',
                          condition: '条件一',
                          id: '1-1-1-1-1'
                        },
                        {
                          name: '普通节点',
                          condition: '条件二',
                          id: '1-1-1-1-2',
                          children: [
                            {
                              name: 'END',
                              type: 'stop',
                              condition: '否',
                              id: '1-1-1-1-2-1',
                            }
                          ]
                        },
                        {
                          name: '普通节点',
                          condition: '条件三',
                          id: '1-1-1-1-3'
                        }
                      ]
                    },
                    {
                      name: '普通节点',
                      condition: '否',
                      id: '1-1-1-2',
                      children: [
                        {
                          name: 'END',
                          type: 'stop',
                          id: '1-1-1-3',
                          condition: '否'
                        }
                      ]
                    },
                    {
                      name: '普通节点',
                      id: '1-1-1-3',
                      condition: '不理解'
                    }
                  ]
                },
                {
                  name: 'END',
                  type: 'stop',
                  condition: '否',
                  id: '1-1-2'
                }
              ]
            }
          ]
        }
      ],
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
      root: [] // 封装的节点对象
    }
  },
  methods: {
    /** @description 将每一个节点封装成SVG中的节点，带有左上角坐标
     *  @augments value 节点文本内容
     *  @augments id 节点id
     *  @augments x 节点左上角x坐标
     *  @augments y 节点左上角y坐标
     *  @returns 返回节点对象，包括节点内容，节点左上角坐标，节点的宽度、高度，子节点列表，子节点中叶子节点的个数(为了计算占用空间)
    */
    Node (value = '', id = '', condition = '', leafCount = 0, x = 0, y = 0, type = 'normal') {
      let obj = {}
      let width = this.getStrBytes(value) * this.fontSize / 2 + 20
      let height = this.fontSize + 20
      obj.value = value
      obj.id = id
      obj.x = x
      obj.y = y
      obj.width = width
      obj.height = height
      obj.leafCount = leafCount
      obj.condition = condition
      obj.children = []
      obj.type = type
      return obj
    },
    /** @description 定义一个条件节点 */
    ConditionNode (value = '') {
      let obj = {}
      let width = this.getStrBytes(value) * (this.conditionFontSize + 2 ) / 2 + 10
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
          if (!item.children || item.children.length === 0 
            || (item.children.length === 1 && item.children[0].type === 'stop')) {
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
      let rect = this.svgInstance.rect(node.x, node.y, node.width, node.height, 2)
      rect.attr({
        fill: '#fff',
        stroke: '#c7d3e1',
        strokeWidth: 1
      })
      let text = this.svgInstance.text(node.x + 10, node.y + this.fontSize + 8, node.value).attr({
        fontSize: this.fontSize,
        fill: '#333333'
      })
      let g = this.svgInstance.g()
      g.add(rect, text)
      g.addClass('node _' + node.id)
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
        _this.$nextTick(() => {
          document.querySelector('.contextMenu-Container').style.left = event.clientX - 260 + 'px'
          document.querySelector('.contextMenu-Container').style.top = event.clientY -70 + 'px'
        })
        return false
      }
    },
    /** @description 画两条线之间的条件节点 */
    drawConditionNode (fromNode, toNode) {
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
        conditionNode.x = toNode.x - this.horizonSpace / 4 - conditionNode.width / 2
        conditionNode.y = toNode.y + 6
      }
      let rect = this.svgInstance.rect(conditionNode.x, conditionNode.y, conditionNode.width, conditionNode.height, 2)
      rect.attr({
        fill: '#c7d3e1'
      })
      let text = this.svgInstance.text(conditionNode.x + 5, conditionNode.y + this.fontSize + 2, conditionNode.value).attr({
        fontSize: this.conditionFontSize,
        fill: '#022a46'
      })
      let g = this.svgInstance.g()
      g.add(rect, text)
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
                L${fromNode.x + fromNode.width + this.horizonSpace / 2} ${fromNode.y + fromNode.height / 2}
                M${fromNode.x + fromNode.width + this.horizonSpace / 2} ${fromNode.y + fromNode.height / 2}
                L${fromNode.x + fromNode.width + this.horizonSpace / 2} ${toNode.y + toNode.height / 2}
                M${fromNode.x + fromNode.width + this.horizonSpace / 2} ${toNode.y + toNode.height / 2}
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
        stroke: '#c7d3e1',
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
      if (parentNode === null) {
        // root = this.Node(data[0].name, data[0].id, data[0].condition, data[0].leafCount, this.rootPosition.x, this.rootPosition.y)
        root = this.ImageNode(data[0].name, data[0].src, data[0].leafCount)
        data = data[0].children
        this.transformData(data, root)
      } else{
        root = parentNode
        let childNodesX = root.x + root.width + this.horizonSpace
        let baseY = root.y - (root.leafCount - 1) * (root.height + this.verticalSpace) / 2
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
            let node = _this.Node(item.name, item.id, item.condition, item.leafCount, childNodesX, PosY)
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
      this.getLeafCount(this.data)
      this.root = this.transformData(this.data, null)
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
      }
    },
    /** @description 在界面上点击鼠标关闭鼠标右键菜单 */
    hideContextMenu () {
      this.showContextMenu = false
      // this.contextMenuNode = {}
    },
    /** 关闭编辑属性值界面 */
    closeEditNode () {
      this.showEditNode = false
      let className = '._' + this.contextMenuNode.id + ' text'
      let ele = this.svgInstance.select(className)
      ele.node.innerHTML = this.nodeAttr.nodeName
    }
  },
  mounted () {
    this.initSVG()
    document.onclick = this.hideContextMenu
  }
}
</script>
<style lang='less'>
@titleHeight: 40px;

.config-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
      line-height: @titleHeight;
      padding: 0 20px;
    }
    h3 {
      font-weight: bold;
      border-bottom: none;
    }
  }
  .svgContainer {
    width:100%;
    height:100%;
  }
  .node{
    cursor: pointer;
  }
  .editNodeAttr {
    position: absolute;
    right: 0;
    top: @titleHeight;
    width: 540px;
    bottom: 0;
    box-sizing: border-box;
    background: #eff3f5;
    box-shadow: -1px 0px 5px #ccc;
  }
  .formContent {
    position: absolute;
    top: @titleHeight;
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
  .fade-enter-active, .fade-leave-active {
    transition: width .3s
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active in below version 2.1.8 */ {
    width: 0px;
  }
}
</style>