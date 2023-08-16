import ReactRenderer from '@alilc/lowcode-react-renderer';
import ReactDOM from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import { buildComponents, assetBundle, AssetLevel, AssetLoader } from '@alilc/lowcode-utils';
import { injectComponents } from '@alilc/lowcode-plugin-inject';
import { packageJson, propertyJson } from './data';

const Home = () => {
  const [data,setData] = useState({schema: undefined,components: undefined})
  const [info, setInfo] = useState<{id: string}>()

  // 查询下一个表单,每次查询都会返回下一步的schema和id
  const queryProgess = () => {
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            // 每次请求都会返回新的id
            id: new Date().getTime(),
            packageJson,
            propertyJson
          }
        })
      },200)
    })
  }
  // 模拟表单提交
  const submitFofrm = (param:{id: string; formData: any}) => {
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        resolve({
          code: 200
        })
      },200)
    })
  }

  const handleSchema = async (packages: any,projectSchema: any) => {
    const { componentsMap: componentsMapArray, componentsTree } = projectSchema;
    const componentsMap: any = {};
    componentsMapArray.forEach((component: any) => {
      componentsMap[component.componentName] = component;
    });
    const schema = componentsTree[0];

    const libraryMap = {};
    const libraryAsset = [];
    packages.forEach(({ package: _package, library, urls, renderUrls }) => {
      libraryMap[_package] = library;
      if (renderUrls) {
        libraryAsset.push(renderUrls);
      } else if (urls) {
        libraryAsset.push(urls);
      }
    });

    // TODO asset may cause pollution
    const assetLoader = new AssetLoader();
    await assetLoader.load(libraryAsset);
    const components = await injectComponents(buildComponents(libraryMap, componentsMap));

    setData({
      schema,
      components,
    });
  }
  const handleProgressQuery = async () => {
    const res = await queryProgess()
    if(res.code === 200) {
      setInfo(
        {
          id: res.data.id
        }
      )

      // 模拟返回的schema
      handleSchema(res.data.packageJson,res.data.propertyJson)
    }
  }

  useEffect(() => {
    // id改变，刷新apphellper，带入最新的id
    console.log('info改变了===', info)
    setAppHelper({
      utils: {
        submit: submit
      },
      constants: {
        info: {...info}
      }
    })
  },[info?.id])

  const submit  = async (value: any,info: any) => {
    console.log('提交时的info===',info)
    const res = await submitFofrm({
      ...info,
      formData: value
    })
    if(res.code === 200) {
      handleProgressQuery()
    }
  }
  const [appHelper, setAppHelper] = useState({
    utils: {
      submit: submit
    },
    constants: {
      info: {...info}
    }
  })
  useEffect(() => {
    // 请求第一个表单
    handleProgressQuery()
  },[])
  return <div className="lowcode-plugin-sample-preview">
    <ReactRenderer
      className="lowcode-plugin-sample-preview-content"
      schema={data.schema}
      components={data.components}
      appHelper={appHelper}
    />
  </div>
}
export default Home;