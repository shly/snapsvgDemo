<template>
	<div class="container">
		<svg id="svg" class="demo"></svg>
	</div>
</template>
<script>
import Snap from 'snapsvg'
export default {
  data () {
    return {
      svgInstance: {},
      fontSize: 12,
      conditionFontSize: 10,
      horizonSpace: 150,
      verticalSpace: 50,
      rootPosition: {
        x: 50,
        y: 300
      },
      selectedNode: {},
      data: [
        {
          name: '机器人',
          condition: '',
          children: [
            {
              name: '普通节点',
              condition: '',
              children: [
                {
                  name: '普通节点',
                  condition: '是',
                  children: [
                    {
                      name: '普通节点',
                      condition: '是',
                      children: [
                        {
                          name: '普通节点',
                          condition: '条件一'
                        },
                        {
                          name: '普通节点',
                          condition: '条件二'
                        },
                        {
                          name: '普通节点',
                          condition: '条件三'
                        }
                      ]
                    },
                    {
                      name: '普通节点',
                      condition: '否'
                    },
                    {
                      name: '普通节点',
                      condition: '不理解'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
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
    Node (value = '', id = '', condition = '', leafCount = 0, x = 0, y = 0) {
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
      return obj
    },
    ConditionNode (value = '') {
      let obj = {}
      let width = this.getStrBytes(value) * this.conditionFontSize / 2 + 10
      let height = this.conditionFontSize + 10
      obj.value = value
      obj.width = width
      obj.height = height
      return obj
    },
    /** @description 获取节点中叶子节点的个数 */
    getLeafCount (data) {
      let temp = 0
      data.forEach(item => {
        if (!item.children || item.children.length === 0) {
          this.$set(item, 'leafCount', 0)
          temp += 1
        } else {
          let subNodeLeaf = this.getLeafCount(item.children)
          this.$set(item, 'leafCount', subNodeLeaf)
          temp += subNodeLeaf
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
        stroke: '#ccc',
        strokeWidth: 1
      })
      let text = this.svgInstance.text(node.x + 10, node.y + this.fontSize + 8, node.value).attr({
        fontSize: this.fontSize
      })
      let g = this.svgInstance.g()
      g.add(rect, text)
      g.addClass('node ' + node.id)
      g.click(function (e) {
        Snap.selectAll('.active rect').attr({
          stroke: '#ccc'
        })
        g.addClass('active')
        rect.attr({
          stroke: 'red'
        })
        _this.selectedNode = node
      })
      g.mousedown(function (e) {
        if (e.button === 2) {
          alert(node.value)
        }
      })
      return node
    },
    drawConditionNode (node) {
      let rect = this.svgInstance.rect(node.x, node.y, node.width, node.height, 2)
      rect.attr({
        fill: '#ccc'
      })
      let text = this.svgInstance.text(node.x + 5, node.y + this.fontSize + 2, node.value).attr({
        fontSize: this.conditionFontSize
      })
      let g = this.svgInstance.g()
      g.add(rect, text)
      return node
    },
    /** @description 画两个节点之间的线
     *  @augments from 开始节点
     *  @augments to 截止节点
     */
    drawLine (fromNode, toNode) {
      let path = `M${fromNode.x + fromNode.width} ${fromNode.y + fromNode.height / 2}
                  L${fromNode.x + fromNode.width + this.horizonSpace / 2} ${fromNode.y + fromNode.height / 2}
                  M${fromNode.x + fromNode.width + this.horizonSpace / 2} ${fromNode.y + fromNode.height / 2}
                  L${fromNode.x + fromNode.width + this.horizonSpace / 2} ${toNode.y + toNode.height / 2}
                  M${fromNode.x + fromNode.width + this.horizonSpace / 2} ${toNode.y + toNode.height / 2}
                  L${toNode.x} ${toNode.y + toNode.height / 2}
                  `
      let line = this.svgInstance.path(path)
      line.attr({
        stroke: '#000',
        strokeWidth: 1,
        'stroke-dasharray': '1, 2'
      })
      if (toNode.condition) {
        let conditionNode = this.ConditionNode(toNode.condition)
        if (fromNode.x === toNode.x) {
          // conditionNode.x = toNode.x
          // conditionNode.y = toNode.y
        } else if (fromNode.y === toNode.y && fromNode.children.length === 1) {
          conditionNode.x = toNode.x - this.horizonSpace / 2 - conditionNode.width / 2
          conditionNode.y = toNode.y + 6
        } else {
          conditionNode.x = toNode.x - this.horizonSpace / 4 - conditionNode.width / 2
          conditionNode.y = toNode.y + 6
        }
        this.drawConditionNode(conditionNode)
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
        root = this.Node(data[0].name, data[0].id, data[0].condition, data[0].leafCount, this.rootPosition.x, this.rootPosition.y)
        data = data[0].children
        this.transformData(data, root)
      } else {
        root = parentNode
        let childNodesX = root.x + root.width + this.horizonSpace
        let baseY = root.y - (root.leafCount - 1) * (root.height + this.verticalSpace) / 2
        data.forEach(function (item, i) {
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
        })
      }
      return root
    },
    /** @description 画树 */
    drawFlowChart (root) {
      let _this = this
      this.drawNode(root)
      if (root.children && root.children.length > 0) {
        root.children.forEach(function (item) {
          _this.drawLine(root, item)
          _this.drawFlowChart(item)
        })
      }
    },
    /** @description init
     */
    init () {
      this.svgInstance = Snap('#svg')
      this.getLeafCount(this.data)
      let root = this.transformData(this.data, null)
      this.drawFlowChart(root)
    }
  },
  mounted () {
    this.init()
  }
}
</script>
<style>
	.demo {
		width:1200px;
		height:800px;
	}
  .node{
    cursor: pointer;
  }
</style>