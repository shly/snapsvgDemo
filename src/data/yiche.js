
 var data = [  // 节点数据
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
            name: 'sddd',
            condition: 'ss，ss',
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
]

export default {
  data
}