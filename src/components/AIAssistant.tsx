import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User, Lightbulb, HelpCircle, BookOpen, MapPin } from 'lucide-react';
import { aiApi } from '../lib/api';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const presetQuestions = [
  { icon: BookOpen, text: "介绍一下青铜器", category: "文物知识" },
  { icon: Lightbulb, text: "博物馆参观注意事项", category: "参观指南" },
  { icon: HelpCircle, text: "你能帮我做什么？", category: "功能介绍" },
  { icon: MapPin, text: "推荐几个博物馆", category: "博物馆推荐" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好！我是数字文物博物馆的AI助手"文博助手"。我可以帮您了解文物知识、历史背景、文化内涵，或者为您提供参观建议。\n\n💡 **您可以问我：**\n• 青铜器、陶瓷、玉器、书画等文物知识\n• 博物馆参观建议和注意事项\n• 文物的历史背景和文化意义',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // 调用DeepSeek API（或模拟响应）
      const response = await aiApi.chatWithAI(
        currentInput, 
        messages.slice(-5).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，我现在无法回复您的消息。请检查网络连接或稍后再试。',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePresetQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI助手 - 文博助手
            {/* <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-auto">
                模拟模式
            </span> */}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 1 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    快速开始
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {presetQuestions.map((preset, index) => {
                      const IconComponent = preset.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start h-auto p-2 text-left"
                          onClick={() => handlePresetQuestion(preset.text)}
                        >
                          <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{preset.text}</div>
                            <div className="text-xs text-muted-foreground">{preset.category}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2 mb-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入您的问题...（例如：介绍一下青铜器）"
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {/* <div className="text-xs text-muted-foreground text-center">
              💡 现在在模拟模式下运行，无需API密钥即可体验完整功能
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
