import { DashboardContainer, DashboardContent, Header, Transactions } from '@/components/shared';

export default function Dashboard() {
  return (
    <DashboardContainer>
      <Header />
      <div className="flex justify-around items-start">
        <DashboardContent />
        <div className="">Schedule</div>
      </div>
      <Transactions className="w-[600px]" title="Transactions" />
    </DashboardContainer>
  );
}
// внесу некоторые коректы 
// 1 ui деелаем с помощю shadcn
// 2 нужен еще добавить i18n для мультиязычности (возможно чтото другое используя best practics, а возможно сылаясь на анализ вобще не нужен этот функцыонал ссылаясь на то что во многих браузерах есть встроеный перевод)
// 3 нужно что б это веб приложение можно было добавить как приложенмие с иконкой на рабочий стол телефона
// 4 каккие страницы и что на них будет нужно сразу обсуждать или после разработки схемы?
